import type { ScriptBlockKey, ScriptBlocks } from '../types/types';

export const parseHtmlToBlocks = (html: string): ScriptBlocks => {
  // ── Утилиты ──────────────────────────────────────────────────────────

  /**
   * Извлекает все <style> блоки из HTML, сгенерированного docx-preview.
   */
  const extractStyleBlocks = (source: string): string => {
    const matches = source.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
    return matches ? matches.join('\n') : '';
  };

  /**
   * Добавляет !important ко всем inline-стилям цвета/фона,
   * а также ко всем правилам color внутри <style> блоков.
   */
  const enforceColors = (block: string): string => {
    let result = block.replace(/style="([^"]*)"/gi, (_fullMatch, styleContent: string) => {
      const enforced = styleContent.replace(
        /\b(color|background-color|background)\s*:\s*([^;!"]+)/gi,
        (__, prop: string, value: string) => {
          const trimmed = value.trim();
          if (trimmed.endsWith('!important')) return `${prop}: ${trimmed}`;
          return `${prop}: ${trimmed} !important`;
        },
      );
      return `style="${enforced}"`;
    });

    result = result.replace(
      /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
      (_full, openTag: string, css: string, closeTag: string) => {
        const enforcedCss = css.replace(
          /\b(color|background-color|background)\s*:\s*([^;}"!]+)/gi,
          (__, prop: string, value: string) => {
            const trimmed = value.trim();
            if (trimmed.endsWith('!important')) return `${prop}: ${trimmed}`;
            return `${prop}: ${trimmed} !important`;
          },
        );
        return `${openTag}${enforcedCss}${closeTag}`;
      },
    );

    return result;
  };

  /**
   * Вставляет переносы строк между блочными тегами.
   */
  const insertSpaceBetweenLines = (block: string): string =>
    block
      .replace(
        /(<\/(?:p|h[1-6]|li|ol|ul|table|tr|td|th|div|section|blockquote)>)\s*(<(?:p|h[1-6]|li|ol|ul|table|tr|td|th|div|section|blockquote)\b)/gi,
        '$1\n\n$2',
      )
      .replace(/(<\/li>)\s*(<li\b)/gi, '$1\n$2')
      .replace(/(<(?:ol|ul)[^>]*>)\s*(<li\b)/gi, '$1\n$2')
      .replace(/(<\/li>)\s*(<\/(?:ol|ul)>)/gi, '$1\n$2')
      .replace(/(<\/tr>)\s*(<tr\b)/gi, '$1\n$2')
      .replace(/(<table[^>]*>)\s*(<tr\b)/gi, '$1\n$2')
      .replace(/(<\/tr>)\s*(<\/table>)/gi, '$1\n$2')
      .trim();

  /**
   * Находит начало ближайшего открывающего блочного тега перед offset.
   */
  const findOpeningTagBefore = (source: string, offset: number): number => {
    const before = source.substring(0, offset);
    const match = before.match(/.*(<(?:p|h\d|li|tr|td|th|table|ol|ul|div|section)\b)/s);
    return match ? before.lastIndexOf(match[1]) : offset;
  };

  /**
   * Находит конец ближайшего закрывающего блочного тега после offset.
   */
  const findClosingTagAfter = (source: string, offset: number): number => {
    const after = source.substring(offset);
    const match = after.match(/<\/(?:p|h\d|li|tr|td|th|table|ol|ul|div|section)>/);
    return match ? offset + (match.index ?? 0) + match[0].length : offset;
  };

  /**
   * Строит карту: для каждого текстового символа (не внутри тега,
   * не пробел/перенос) запоминает его и позицию в исходном HTML.
   * Корректно декодирует HTML-сущности (&nbsp;, &amp; и т.д.).
   */
  const buildTextToHtmlMap = (source: string): { char: string; htmlIndex: number }[] => {
    const map: { char: string; htmlIndex: number }[] = [];
    let i = 0;
    let inTag = false;

    while (i < source.length) {
      if (source[i] === '<') {
        inTag = true;
        i++;
        continue;
      }
      if (source[i] === '>') {
        inTag = false;
        i++;
        continue;
      }

      if (!inTag) {
        // Проверяем HTML-сущность
        const remaining = source.substring(i);
        const entityMatch = remaining.match(/^&(?:#(\d+)|#x([0-9a-fA-F]+)|(\w+));/);

        if (entityMatch) {
          let decodedChar: string;

          if (entityMatch[1]) {
            // &#123;
            decodedChar = String.fromCharCode(Number(entityMatch[1]));
          } else if (entityMatch[2]) {
            // &#xAB;
            decodedChar = String.fromCharCode(parseInt(entityMatch[2], 16));
          } else {
            // &name;
            const entityName = entityMatch[3];
            const entities: Record<string, string> = {
              nbsp: '\u00A0',
              amp: '&',
              lt: '<',
              gt: '>',
              quot: '"',
              apos: "'",
            };
            decodedChar = entities[entityName] ?? entityMatch[0];
          }

          // Пропускаем пробельные символы (включая &nbsp; → \u00A0)
          if (!/\s/.test(decodedChar) && decodedChar !== '\u00A0') {
            map.push({ char: decodedChar, htmlIndex: i });
          }

          i += entityMatch[0].length;
        } else {
          const ch = source[i];
          // Пропускаем пробелы, табы, переносы строк
          if (!/\s/.test(ch)) {
            map.push({ char: ch, htmlIndex: i });
          }
          i++;
        }
      } else {
        i++;
      }
    }

    return map;
  };

  /**
   * Ищет совпадение нормализованного ключа (без пробелов/переносов)
   * в карте текстовых символов.
   * Возвращает позиции начала и конца совпадения в исходном HTML.
   */
  const findByNormalizedText = (
    textMap: { char: string; htmlIndex: number }[],
    key: string,
  ): { startHtmlIdx: number; endHtmlIdx: number } | null => {
    // Нормализуем ключ: удаляем все пробельные символы
    const normalizedKey = key.replace(/[\s\u00A0]/g, '');

    if (normalizedKey.length === 0) return null;

    // Собираем строку из символов карты для поиска подстроки
    const textStr = textMap.map((item) => item.char).join('');
    const matchIndex = textStr.indexOf(normalizedKey);

    if (matchIndex === -1) return null;

    return {
      startHtmlIdx: textMap[matchIndex].htmlIndex,
      endHtmlIdx: textMap[matchIndex + normalizedKey.length - 1].htmlIndex,
    };
  };

  // ── Извлекаем <style> блоки ──────────────────────────────────────────
  const styleBlocks = extractStyleBlocks(html);

  // Убираем <style> из HTML для корректного поиска маркеров по тексту
  const bodyHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // ── Маркеры секций ───────────────────────────────────────────────────
  // Поиск ведётся по key без пробелов/переносов — совпадает с текстом
  // файла если последовательность символов (без пробелов) идентична.
  const markers: { key: ScriptBlockKey }[] = [
    { key: 'KPI:' },
    { key: 'Что клиент не принимает:' },
    { key: 'О компании:' },
    { key: 'Красным выделены обязательные вопросы и предложения!' },
  ];

  // ── Строим карту текстовых символов → позиций в HTML ─────────────────
  const textMap = buildTextToHtmlMap(bodyHtml);

  // ── Определяем позиции маркеров (порядок в файле произвольный) ───────
  const positions: {
    key: ScriptBlockKey;
    start: number;
    headerEnd: number;
  }[] = [];

  for (const marker of markers) {
    const match = findByNormalizedText(textMap, marker.key);
    if (!match) continue;

    const tagStart = findOpeningTagBefore(bodyHtml, match.startHtmlIdx);
    const tagEnd = findClosingTagAfter(bodyHtml, match.endHtmlIdx);

    positions.push({ key: marker.key, start: tagStart, headerEnd: tagEnd });
  }

  // Сортируем по фактическому расположению в документе
  positions.sort((a, b) => a.start - b.start);

  // ── Вырезаем HTML-блоки ──────────────────────────────────────────────
  const blocks = {} as Record<ScriptBlockKey, string>;

  for (let i = 0; i < positions.length; i++) {
    const contentStart = positions[i].headerEnd;
    const contentEnd = i + 1 < positions.length ? positions[i + 1].start : bodyHtml.length;

    let blockHtml = bodyHtml.substring(contentStart, contentEnd).trim();

    // 1. Форматируем переносы
    blockHtml = insertSpaceBetweenLines(blockHtml);

    // 2. Подкладываем <style> блоки + усиливаем цвета через !important
    blockHtml = enforceColors(styleBlocks + '\n' + blockHtml);

    blocks[positions[i].key] = blockHtml;
  }

  return blocks;
};
