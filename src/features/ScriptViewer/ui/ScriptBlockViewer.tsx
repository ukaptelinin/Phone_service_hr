// features/script-viewer/ui/ScriptBlockViewer.tsx
import React from 'react';
import { useDocx } from '@/entities/script/model/useDocx';

interface ScriptBlockViewerProps {
  blockKey: string;
  className?: string;
}

export const ScriptBlockViewer: React.FC<ScriptBlockViewerProps> = ({
  blockKey,
  className = '',
}) => {
  const { scriptBlocks } = useDocx();
  const htmlContent = scriptBlocks[blockKey];

  if (!htmlContent) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-default-400 ${className}`}
      >
        <p>Блок "{blockKey}" не найден в загруженном документе</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-h-[63vh] overflow-y-auto p-4 ${className}`}>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};
