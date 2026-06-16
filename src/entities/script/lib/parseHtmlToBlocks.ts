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
   * Применяет стили таблицы для секции скрипта:
   * - Вставляет CSS с border, padding, width для table/td/th
   * - Добавляет !important к display-свойствам табличных элементов inline
   * - Гарантирует корректное отображение таблицы в любом контексте
   */
  const enforceTableStyles = (block: string): string => {
    const tableCss = `<style>
      .script-table-section table {
        border-collapse: collapse !important;
        width: 100% !important;
        table-layout: fixed !important;
        display: table !important;
      }
      .script-table-section thead {
        display: table-header-group !important;
      }
      .script-table-section tbody {
        display: table-row-group !important;
      }
      .script-table-section tr {
        display: table-row !important;
      }
      .script-table-section td,
      .script-table-section th {
        border: 1px solid #000 !important;
        padding: 6px 8px !important;
        vertical-align: top !important;
        display: table-cell !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      .script-table-section th {
        font-weight: bold !important;
        text-align: center !important;
      }
      .script-table-section col {
        display: table-column !important;
      }
      .script-table-section colgroup {
        display: table-column-group !important;
      }
    </style>`;

    // Оборачиваем содержимое в div с классом для скоупинга CSS
    const wrapped = `${tableCss}\n<div class="script-table-section">${block}</div>`;

    // Добавляем !important к inline-стилям связанных с размерами и отображением таблицы
    const result = wrapped.replace(/style="([^"]*)"/gi, (_fullMatch, styleContent: string) => {
      const enforced = styleContent.replace(
        /\b(width|min-width|max-width|border|border-collapse|padding|vertical-align|display)\s*:\s*([^;!"]+)/gi,
        (__, prop: string, value: string) => {
          const trimmed = value.trim();
          if (trimmed.endsWith('!important')) return `${prop}: ${trimmed}`;
          return `${prop}: ${trimmed} !important`;
        },
      );
      return `style="${enforced}"`;
    });

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
   * Вставляет переносы строк между блочными тегами,
   * НО не трогает внутреннюю структуру таблиц (tr, td, th).
   * Используется для секции с таблицей, чтобы не ломать её разметку.
   */
  const insertSpaceBetweenLinesPreserveTable = (block: string): string =>
    block
      .replace(
        /(<\/(?:p|h[1-6]|li|ol|ul|div|section|blockquote)>)\s*(<(?:p|h[1-6]|li|ol|ul|div|section|blockquote)\b)/gi,
        '$1\n\n$2',
      )
      .replace(/(<\/li>)\s*(<li\b)/gi, '$1\n$2')
      .replace(/(<(?:ol|ul)[^>]*>)\s*(<li\b)/gi, '$1\n$2')
      .replace(/(<\/li>)\s*(<\/(?:ol|ul)>)/gi, '$1\n$2')
      // Между table и окружающими блоками — переносы
      .replace(
        /(<\/table>)\s*(<(?:p|h[1-6]|li|ol|ul|div|section|blockquote|table)\b)/gi,
        '$1\n\n$2',
      )
      .replace(/(<\/(?:p|h[1-6]|li|ol|ul|div|section|blockquote)>)\s*(<table\b)/gi, '$1\n\n$2')
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

  // ── Ключ секции с таблицей ───────────────────────────────────────────
  const TABLE_SECTION_KEY: ScriptBlockKey = 'Указать:';

  // ── Извлекаем <style> блоки ──────────────────────────────────────────
  const styleBlocks = extractStyleBlocks(html);

  // Убираем <style> из HTML для корректного поиска маркеров по тексту
  const bodyHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // ── Маркеры секций ───────────────────────────────────────────────────
  const markers: { key: ScriptBlockKey }[] = [
    { key: 'KPI:' },
    { key: 'Что клиент не принимает:' },
    { key: 'Что не принимается:' },
    { key: 'ЧТО НЕ ПРИНИМАЕТСЯ:' },
    { key: 'О компании:' },
    { key: TABLE_SECTION_KEY },
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
    const markerKey: ScriptBlockKey =
      marker.key === 'Что не принимается:' || marker.key === 'ЧТО НЕ ПРИНИМАЕТСЯ:'
        ? 'Что клиент не принимает:'
        : marker.key;
    // ЗДЕСЬ ПОСТАВИТЬ УСЛОВИЕ!!!!!!!!!!!!!
    positions.push({ key: markerKey, start: tagStart, headerEnd: tagEnd });
  }

  // Сортируем по фактическому расположению в документе
  positions.sort((a, b) => a.start - b.start);

  // ── Вырезаем HTML-блоки ──────────────────────────────────────────────
  const blocks = {} as Record<ScriptBlockKey, string>;

  for (let i = 0; i < positions.length; i++) {
    const contentStart = positions[i].headerEnd;
    const contentEnd = i + 1 < positions.length ? positions[i + 1].start : bodyHtml.length;

    let blockHtml = bodyHtml.substring(contentStart, contentEnd).trim();

    const isTableSection = positions[i].key === TABLE_SECTION_KEY;

    // 1. Форматируем переносы (для секции таблицы — без разбиения внутри table)
    blockHtml = isTableSection
      ? insertSpaceBetweenLinesPreserveTable(blockHtml)
      : insertSpaceBetweenLines(blockHtml);

    // 2. Подкладываем <style> блоки + усиливаем цвета через !important
    blockHtml = enforceColors(styleBlocks + '\n' + blockHtml);

    // 3. Для секции с таблицей — дополнительно применяем табличные стили
    if (isTableSection) {
      blockHtml = enforceTableStyles(blockHtml);
    }

    blocks[positions[i].key] = blockHtml;
  }

  return blocks;
};
