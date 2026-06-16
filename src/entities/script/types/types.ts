export type ScriptBlocks = Partial<Record<ScriptBlockKey, string>>; // ключ -> HTML блока

export interface DocxData {
  htmlContent: string;
  fileName: string;
  scriptBlocks: ScriptBlocks;
}

export type ScriptBlockKey =
  | 'KPI:'
  | 'Что клиент не принимает:'
  | 'Что не принимается:'
  | 'ЧТО НЕ ПРИНИМАЕТСЯ:'
  | 'О компании:'
  | 'Указать:';
