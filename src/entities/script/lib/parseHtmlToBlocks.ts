// utils/parseHtmlToBlocks.ts

import type { ScriptBlocks } from '@/entities/script/types/types';

/**
 * Разбивает HTML-строку на блоки по ключевым фразам.
 * Ключи идут в определённом порядке.
 * Возвращает объект, где ключ – это фраза-маркер, а значение – HTML-код до следующего маркера.
 */
export const parseHtmlToBlocks = (html: string): ScriptBlocks => {
  const keys = [
    'KPI:',
    'Что клиент не принимает:',
    'О компании:',
    'Указать: Имя, тип станка, комментарий по потребности согласно доп. вопросов, из наличия/под заказ, город, сроки, время звонка\n\nКрасным выделены обязательные вопросы и предложения!\nСиним подсказки и дополнительные вопросы!',
  ];

  // Извлекаем "чистый" текст без HTML-тегов для поиска позиций
  const plainText = html.replace(/<[^>]*>/g, '');

  // Находим индексы каждого ключа в plainText
  const positions: { key: string; start: number }[] = [];
  for (const key of keys) {
    const index = plainText.indexOf(key);
    if (index !== -1) {
      positions.push({ key, start: index });
    } else {
      console.warn(`Ключ не найден в документе: "${key}"`);
    }
  }

  // Сортируем по позиции
  positions.sort((a, b) => a.start - b.start);

  // Теперь нужно найти соответствующие позиции в исходном HTML.
  // Для этого используем подход: ищем в html подстроку, соответствующую ключу,
  // но ближайшую к найденной позиции в plainText.
  // Проще: ищем каждый ключ в html напрямую (с учётом возможных тегов внутри).
  // Однако key может быть разбит тегами, поэтому сделаем более надёжный поиск по тексту.

  // Вместо сложного маппинга упростим: будем искать каждый ключ в исходном html
  // и брать первое вхождение после предыдущего.
  const htmlPositions: { key: string; start: number }[] = [];
  let lastIndex = 0;
  for (const key of keys) {
    const startIdx = html.indexOf(key, lastIndex);
    if (startIdx !== -1) {
      htmlPositions.push({ key, start: startIdx });
      lastIndex = startIdx + 1;
    } else {
      // Если не нашли, пробуем искать более мягко: убираем из ключа знаки препинания?
      console.warn(`Ключ не найден в HTML: "${key}"`);
    }
  }

  const blocks: ScriptBlocks = {};
  for (let i = 0; i < htmlPositions.length; i++) {
    const currentKey = htmlPositions[i].key;
    const start = htmlPositions[i].start;
    const end = i + 1 < htmlPositions.length ? htmlPositions[i + 1].start : html.length;
    let block = html.substring(start, end).trim();
    blocks[currentKey] = block;
  }

  return blocks;
};
