 // parseScript.ts

import type { ScriptItems, TalkItems } from "@/shared/api/types";



// Ключи-разделители секций (в порядке появления в документе)
const SECTION_KEYS = [
  "KPI:",
  "Что клиент не принимает:",
  "О компании:",
  "Товар/продукт:",
] as const;

// Последний ключ (секция с таблицей)
const TABLE_SECTION_KEY = `Указать: Имя, тип станка, комментарий по потребности согласно доп. вопросов, из наличия/под заказ, город, сроки, время звонка

Красным выделены обязательные вопросы и предложения!
Синим подсказки и дополнительные вопросы!`;

const ALL_KEYS = [...SECTION_KEYS, TABLE_SECTION_KEY] as const;

/**
 * Парсит "плоский" текст документа (без таблицы) на секции.
 * Возвращает Map<ключ_секции, массив_строк_содержимого>.
 */
function splitIntoSections(lines: string[]): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let currentKey: string | null = null;
  let currentLines: string[] = [];
  let buffer = ""; // буфер для многострочного ключа (TABLE_SECTION_KEY)

  const flushCurrentSection = () => {
    if (currentKey !== null) {
      sections.set(
        currentKey,
        currentLines.filter((l) => l.trim() !== "")
      );
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Проверяем, является ли строка началом одного из простых ключей
    const matchedSimpleKey = SECTION_KEYS.find((key) => trimmed === key);

    if (matchedSimpleKey) {
      flushCurrentSection();
      currentKey = matchedSimpleKey;
      currentLines = [];
      continue;
    }

    // Проверяем начало составного ключа (TABLE_SECTION_KEY)
    // Он начинается со слова "Указать:"
    if (trimmed.startsWith("Указать:")) {
      flushCurrentSection();
      // Собираем многострочный ключ — берём текущую и следующие строки,
      // пока они являются частью ключа
      currentKey = TABLE_SECTION_KEY;
      currentLines = [];

      // Пропускаем строки, входящие в состав этого ключа
      // (ищем строки про "Красным..." и "Синим...")
      while (i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim();
        if (
          nextTrimmed.startsWith("Красным") ||
          nextTrimmed.startsWith("Синим") ||
          nextTrimmed === ""
        ) {
          i++;
          continue;
        }
        break;
      }
      continue;
    }

    // Обычная строка — добавляем к текущей секции
    if (currentKey !== null) {
      currentLines.push(line);
    }
  }

  flushCurrentSection();
  return sections;
}

/**
 * Парсит HTML-таблицу из Google Docs и возвращает TalkItems.
 * Левая колонка — ключ, правая — массив строк (разделённых <br> или \n).
 */
function parseHtmlTable(html: string): TalkItems {
  const result: TalkItems = {};

  // Ищем все строки таблицы <tr>...</tr>
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowContent = rowMatch[1];

    // Извлекаем ячейки <td>...</td>
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      cells.push(cellMatch[1]);
    }

    if (cells.length >= 2) {
      const leftKey = stripHtml(cells[0]).trim();
      const rightValue = stripHtml(cells[1])
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      if (leftKey) {
        result[leftKey] = rightValue;
      }
    }
  }

  return result;
}

/**
 * Парсит таблицу из plain-text формата (разделитель — табуляция или " | ").
 * Каждая строка: "Левая колонка\tПравая колонка" или "Левая колонка | Правая колонка"
 */
function parsePlainTextTable(lines: string[]): TalkItems {
  const result: TalkItems = {};
  let currentLeftKey: string | null = null;

  for (const line of lines) {
    // Пробуем разделить по табуляции
    let parts = line.split("\t");
    if (parts.length < 2) {
      // Пробуем разделить по " | "
      parts = line.split(" | ");
    }

    if (parts.length >= 2) {
      const left = parts[0].trim();
      const right = parts
        .slice(1)
        .join(" | ")
        .trim();

      if (left) {
        currentLeftKey = left;
        result[currentLeftKey] = right
          ? right.split(/\n|\\n/).map((s) => s.trim()).filter(Boolean)
          : [];
      } else if (currentLeftKey && right) {
        // Продолжение предыдущей строки (левая колонка пустая — объединённая ячейка)
        result[currentLeftKey].push(
          ...right.split(/\n|\\n/).map((s) => s.trim()).filter(Boolean)
        );
      }
    } else if (currentLeftKey && line.trim()) {
      // Строка без разделителя — продолжение правой колонки
      result[currentLeftKey].push(line.trim());
    }
  }

  return result;
}

/** Удаляет HTML-теги из строки */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

// ─────────────────────────────────────────────
// Главная функция: парсинг всего документа
// ─────────────────────────────────────────────

/**
 * Парсит содержимое документа-скрипта (plain text) в структуру ScriptItems.
 *
 * @param documentText — полный текст документа (plain text, скопированный из Google Docs)
 * @param tableLines   — строки, относящиеся к таблице (последняя секция).
 *                        Если не переданы, парсер попытается извлечь их автоматически.
 */
export function parseScriptDocument(documentText: string): ScriptItems {
  const lines = documentText.split("\n");
  const sections = splitIntoSections(lines);

  const result: ScriptItems = {};

  for (const [key, value] of sections.entries()) {
    if (key === TABLE_SECTION_KEY) {
      // Последнюю секцию парсим как таблицу
      result[key] = parsePlainTextTable(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Вариант для HTML-содержимого (если документ получен через Google Docs API
 * в формате HTML — export?format=html).
 */
export function parseScriptDocumentHtml(html: string): ScriptItems {
  // Извлекаем plain-text для верхних секций
  const textContent = stripHtml(html);
  const lines = textContent.split("\n");
  const sections = splitIntoSections(lines);

  const result: ScriptItems = {};

  for (const [key, value] of sections.entries()) {
    if (key === TABLE_SECTION_KEY) {
      // Для таблицы парсим исходный HTML
      result[key] = parseHtmlTable(html);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export default parseScriptDocument;
