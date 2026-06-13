export type ScriptBlocks = Partial<Record<ScriptBlockKey, string>>; // ключ -> HTML блока

export interface DocxData {
  htmlContent: string;
  fileName: string;
  scriptBlocks: ScriptBlocks;
}

export type ScriptBlockKey =
  | 'KPI:'
  | 'Что клиент не принимает:'
  | 'О компании:'
  | 'Красным выделены обязательные вопросы и предложения!';
