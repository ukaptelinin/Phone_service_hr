import type { ScriptBlockKey, ScriptBlocks } from '../types/types';

export const parseHtmlToBlocks = (html: string): ScriptBlocks => {
  // ── Утилиты ──────────────────────────────────────────────────────────
  const stripTags = (s: string): string => s.replace(/<[^>]*>/g, '');

  /**
   * Вставляет пустую строку (\n\n) между закрывающим и открывающим
   * блочными тегами, чтобы HTML был визуально читаемым.
   */
  const insertSpaceBetweenLines = (block: string): string =>
    block
      // Между закрывающим и открывающим блочными тегами → двойной перенос
      .replace(
        /(<\/(?:p|h[1-6]|li|ol|ul|table|tr|td|div|blockquote)>)\s*(<(?:p|h[1-6]|li|ol|ul|table|tr|td|div|blockquote)\b)/gi,
        '$1\n\n$2',
      )
      // Внутри списков: между </li> и <li> → одинарный перенос
      .replace(/(<\/li>)\s*(<li\b)/gi, '$1\n$2')
      // После открывающего <ol>/<ul> перед первым <li>
      .replace(/(<(?:ol|ul)[^>]*>)\s*(<li\b)/gi, '$1\n$2')
      // Перед закрывающим </ol>/</ul>
      .replace(/(<\/li>)\s*(<\/(?:ol|ul)>)/gi, '$1\n$2')
      // Между строками таблицы
      .replace(/(<\/tr>)\s*(<tr\b)/gi, '$1\n$2')
      // После <table> перед первым <tr>
      .replace(/(<table[^>]*>)\s*(<tr\b)/gi, '$1\n$2')
      // Перед </table>
      .replace(/(<\/tr>)\s*(<\/table>)/gi, '$1\n$2')
      .trim();

  /**
   * Находит позицию начала ближайшего открывающего тега
   * (<p, <h*, <li, <tr, <td …) перед указанным смещением.
   */
  const findOpeningTagBefore = (offset: number): number => {
    const before = html.substring(0, offset);
    const match = before.match(/.*(<(?:p|h\d|li|tr|td|table|ol|ul)\b)/s);
    return match ? before.lastIndexOf(match[1]) : offset;
  };

  /**
   * Находит конец закрывающего тега текущего блочного элемента,
   * содержащего маркер (</p>, </h*>, </td>, </tr>, …).
   */
  const findClosingTagAfter = (offset: number): number => {
    const after = html.substring(offset);
    const match = after.match(/<\/(?:p|h\d|li|tr|td|table|ol|ul)>/);
    return match ? offset + (match.index ?? 0) + match[0].length : offset;
  };

  // ── Маркеры секций в порядке появления в документе ───────────────────
  const markers: { key: ScriptBlockKey; search: string }[] = [
    {
      key: 'KPI:',
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
      key: 'Указать: Имя, тип станка, комментарий по потребности согласно доп. вопросов, из наличия/под заказ, город, сроки, время звонка\\n\\nКрасным выделены обязательные вопросы и предложения!\\nСиним подсказки и дополнительные вопросы!',
      search: 'Указать: Имя, тип станка',
    },
  ];

  // ── Определяем позиции каждого маркера в HTML ────────────────────────
  const positions: { key: ScriptBlockKey; start: number; headerEnd: number }[] = [];

  for (const marker of markers) {
    const textIdx = html.indexOf(marker.search);
    if (textIdx === -1) continue;

    const tagStart = findOpeningTagBefore(textIdx);
    const tagEnd = findClosingTagAfter(textIdx);

    positions.push({ key: marker.key, start: tagStart, headerEnd: tagEnd });
  }

  // Сортируем на случай, если порядок маркеров в HTML отличается
  positions.sort((a, b) => a.start - b.start);

  // ── Вырезаем HTML-блоки между маркерами ──────────────────────────────
  const blocks = {} as Record<ScriptBlockKey, string>;

  for (let i = 0; i < positions.length; i++) {
    const contentStart = positions[i].headerEnd;
    const contentEnd = i + 1 < positions.length ? positions[i + 1].start : html.length;

    let blockHtml = html.substring(contentStart, contentEnd).trim();

    // ── Спец-обработка последней секции (таблица скрипта) ─────────────
    if (positions[i].key === markers[3].key) {
      blockHtml = processScriptTable(blockHtml);
    }

    // ── Вставляем пробелы между строками ─────────────────────────────
    blocks[positions[i].key] = insertSpaceBetweenLines(blockHtml);
  }

  return blocks;

  // ── Обработка таблицы скрипта ────────────────────────────────────────
  function processScriptTable(blockHtml: string): string {
    return blockHtml.replace(/<table[\s\S]*?<\/table>/gi, (table) =>
      table.replace(
        /(<tr[^>]*>)\s*(<td[^>]*>)([\s\S]*?)(<\/td>)/gi,
        (_match, trOpen: string, tdOpen: string, tdContent: string, tdClose: string) => {
          const text = stripTags(tdContent).trim();
          if (!text) return `${trOpen}${tdOpen}${tdContent}${tdClose}`;
          return `${trOpen}${tdOpen}<h4>${text}</h4>${tdClose}`;
        },
      ),
    );
  }
};
