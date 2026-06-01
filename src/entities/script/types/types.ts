export type ScriptBlocks = Record<string, string>; // ключ -> HTML блока

export interface DocxData {
  htmlContent: string;
  fileName: string;
  scriptBlocks: ScriptBlocks;
}
