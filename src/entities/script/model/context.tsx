// context/DocxContext.tsx
import React, { createContext, useState, type ReactNode } from 'react';

import type { ScriptBlockKey, ScriptBlocks } from '@/entities/script/types/types';
import { parseHtmlToBlocks } from '../lib';

interface DocxContextValue {
  htmlContent: string;
  fileName: string;
  scriptBlocks: ScriptBlocks;
  scriptBlockKey: ScriptBlockKey;
  setDocxData: (html: string, name: string) => void;
  clearDocxData: () => void;
  selectScriptBlockKey: (blockKey: ScriptBlockKey) => void;
}

export const DocxContext = createContext<DocxContextValue | undefined>(undefined);

export const DocxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlocks>({});
  const [scriptBlockKey, setScriptBlockKey] = useState<ScriptBlockKey>(
    'Указать: Имя, тип станка, комментарий по потребности согласно доп. вопросов, из наличия/под заказ, город, сроки, время звонка\\n\\nКрасным выделены обязательные вопросы и предложения!\\nСиним подсказки и дополнительные вопросы!',
  );

  const setDocxData = (html: string, name: string) => {
    setHtmlContent(html);
    setFileName(name);
    const blocks = parseHtmlToBlocks(html);
    setScriptBlocks(blocks);
  };

  const clearDocxData = () => {
    setHtmlContent('');
    setFileName('');
    setScriptBlocks({});
  };

  const selectScriptBlockKey = (blockKey: ScriptBlockKey) => setScriptBlockKey(blockKey);

  return (
    <DocxContext.Provider
      value={{
        htmlContent,
        fileName,
        scriptBlocks,
        scriptBlockKey,
        setDocxData,
        clearDocxData,
        selectScriptBlockKey,
      }}
    >
      {children}
    </DocxContext.Provider>
  );
};
