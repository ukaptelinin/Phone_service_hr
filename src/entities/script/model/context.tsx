// context/DocxContext.tsx
import React, { createContext, useState, type ReactNode } from 'react';

import type { ScriptBlockKey, ScriptBlocks } from '@/entities/script/types/types';
import { parseHtmlToBlocks } from '../lib';

interface DocxContextValue {
  htmlContent: string;
  fileData: ArrayBuffer | null;
  fileName: string;
  scriptBlocks: ScriptBlocks;
  scriptBlockKey: ScriptBlockKey;
  scriptMode: boolean;
  setDocxData: (html: string, name: string) => void;
  clearDocxData: () => void;
  selectScriptBlockKey: (blockKey: ScriptBlockKey) => void;
  setDocxContent: (html: string) => void;
  toggleScriptMode: () => void;
  setFileContent: (result: ArrayBuffer) => void;
}

export const DocxContext = createContext<DocxContextValue | undefined>(undefined);

export const DocxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [scriptMode, setScriptMode] = useState(false);
  const [fileName, setFileName] = useState('');
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlocks>({});
  const [scriptBlockKey, setScriptBlockKey] = useState<ScriptBlockKey>('Указать:');

  const setDocxData = (html: string, name: string) => {
    setHtmlContent(html);
    setFileName(name);
    const blocks = parseHtmlToBlocks(html);
    setScriptBlocks(blocks);
  };

  const setFileContent = (result: ArrayBuffer) => setFileData(result);

  const setDocxContent = (html: string) => setHtmlContent(html);

  const toggleScriptMode = () => setScriptMode(!scriptMode);

  const clearDocxData = () => {
    setHtmlContent('');
    setFileName('');
    setScriptBlocks({});
  };

  const selectScriptBlockKey = (blockKey: ScriptBlockKey) => {
    setScriptBlockKey(blockKey);
  };

  return (
    <DocxContext.Provider
      value={{
        htmlContent,
        fileData,
        fileName,
        scriptBlocks,
        scriptBlockKey,
        scriptMode,
        setDocxData,
        setFileContent,
        clearDocxData,
        selectScriptBlockKey,
        setDocxContent,
        toggleScriptMode,
      }}
    >
      {children}
    </DocxContext.Provider>
  );
};
