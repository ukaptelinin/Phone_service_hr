 // fetchGoogleDoc.ts


import { parseScriptDocumentHtml } from "./parseScript";
import type { ScriptItems } from "./types";

//const GOOGLE_DOC_ID = "1KPRTpPDHlKnGpGDV6XWghjCVFS0VJ-x_t_uAcqsJCls";

/**
 * Загружает документ Google Docs как HTML и парсит его.
 * Документ должен быть опубликован (Файл → Опубликовать в интернете)
 * или доступен по ссылке.
 */
export const fetchAndParseGoogleDoc = async(url:string): Promise<ScriptItems> => {
  // Вариант 1: Через экспорт (документ должен быть публичным)
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)

  if (!match) {
    throw new Error(`Невалидный Google Docs URL: ${url}`)
  }

  const docId = match[1]

  // 2. Формируем URL для экспорта в текстовом формате
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`


  const response = await fetch(exportUrl);

  if (!response.ok) {
    throw new Error(
      `Не удалось загрузить документ: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  return parseScriptDocumentHtml(html);
}

/**
 * Вариант 2: Через Google Docs API (требуется API-ключ или OAuth).
 
export async function fetchViaGoogleApi(
  apiKey: string
): Promise<ScriptItems> {
  const url = `https://docs.googleapis.com/v1/documents/${GOOGLE_DOC_ID}?key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const doc = await response.json();

  // Извлекаем plain-text из структуры Google Docs API
  const plainText = extractPlainText(doc);
  const { parseScriptDocument } = await import("./parseScript");
  return parseScriptDocument(plainText);
}*/

/* Рекурсивно извлекает текст из ответа Google Docs API */
/*function extractPlainText(doc: any): string {
  const content = doc.body?.content || [];
  let text = "";

  for (const element of content) {
    if (element.paragraph) {
      for (const el of element.paragraph.elements || []) {
        text += el.textRun?.content || "";
      }
    }
    if (element.table) {
      for (const row of element.table.tableRows || []) {
        const cells = row.tableCells || [];
        const cellTexts = cells.map((cell: any) => {
          let cellText = "";
          for (const p of cell.content || []) {
            for (const el of p.paragraph?.elements || []) {
              cellText += el.textRun?.content || "";
            }
          }
          return cellText.trim();
        });
        text += cellTexts.join("\t") + "\n";
      }
    }
  }

  return text;
} */
