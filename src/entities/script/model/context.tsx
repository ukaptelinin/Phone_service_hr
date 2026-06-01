// context/DocxContext.tsx
import React, { createContext, useState, type ReactNode } from 'react';

import type { ScriptBlocks } from '@/entities/script/types/types';
import { parseHtmlToBlocks } from '../lib';

interface DocxContextValue {
  htmlContent: string;
  fileName: string;
  scriptBlocks: ScriptBlocks;
  setDocxData: (html: string, name: string) => void;
  clearDocxData: () => void;
}

export const DocxContext = createContext<DocxContextValue | undefined>(undefined);

export const DocxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlocks>({});

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

  return (
    <DocxContext.Provider
      value={{ htmlContent, fileName, scriptBlocks, setDocxData, clearDocxData }}
    >
      {children}
    </DocxContext.Provider>
  );
};
