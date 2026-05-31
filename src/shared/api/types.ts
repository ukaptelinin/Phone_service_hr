// types.ts

// Для последней секции — таблица: левая колонка → массив строк правой колонки
export type TalkItems = Record<string, string[]>;

// Значение может быть либо массивом строк (для обычных секций),
// либо TalkItems (для последней секции с таблицей)
export type SectionValue = string[] | TalkItems;

// Итоговая структура
export type ScriptItems = Record<string, SectionValue>;
