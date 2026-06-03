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
  | 'Указать: Имя, тип станка, комментарий по потребности согласно доп. вопросов, из наличия/под заказ, город, сроки, время звонка\\n\\nКрасным выделены обязательные вопросы и предложения!\\nСиним подсказки и дополнительные вопросы!';
