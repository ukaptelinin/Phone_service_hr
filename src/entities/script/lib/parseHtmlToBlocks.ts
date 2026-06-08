import type { ScriptBlockKey, ScriptBlocks } from '../types/types';

export const parseHtmlToBlocks = (html: string): ScriptBlocks => {
  // ── Утилиты ──────────────────────────────────────────────────────────

  /**
   * Извлекает все <style> блоки из HTML, сгенерированного docx-preview.
   * Без них CSS-классы со стилями (цвет, шрифт, размер) не сработают.
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
    // 1. Усиливаем inline style="...color..."
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

    // 2. Усиливаем color/background-color внутри <style> блоков
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
   * Расширен для docx-preview: добавлены div, section, span.
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

  // ── Извлекаем <style> блоки ──────────────────────────────────────────
  const styleBlocks = extractStyleBlocks(html);

  // Убираем <style> из HTML для корректного поиска маркеров по тексту
  const bodyHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // ── Маркеры секций ───────────────────────────────────────────────────
  const markers: { key: ScriptBlockKey; search: string }[] = [
    {
      key: 'KPI',
      search: 'KPI:',
    },
    {
      key: 'Что клиент не принимает:',
      search: 'Что клиент не принимает:',
    },
    {
      key: 'О компании:',
      search: 'О компании:',
    },
    {
      key: 'Красным выделены обязательные вопросы и предложения!',
      search: 'Красным выделены',
    },
  ];

  // ── Определяем позиции маркеров (ищем в bodyHtml без <style>) ───────
  const positions: {
    key: ScriptBlockKey;
    start: number;
    headerEnd: number;
  }[] = [];

  for (const marker of markers) {
    const textIdx = bodyHtml.indexOf(marker.search);
    if (textIdx === -1) continue;

    const tagStart = findOpeningTagBefore(bodyHtml, textIdx);
    const tagEnd = findClosingTagAfter(bodyHtml, textIdx);

    positions.push({ key: marker.key, start: tagStart, headerEnd: tagEnd });
  }

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
