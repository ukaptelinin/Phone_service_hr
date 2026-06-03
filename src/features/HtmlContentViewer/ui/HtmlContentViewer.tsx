import React from 'react';

interface HtmlContentViewerProps {
  htmlContent: string;
  className?: string;
}

export const HtmlContentViewer: React.FC<HtmlContentViewerProps> = ({
  htmlContent,
  className = '',
}) => {
  if (!htmlContent) {
    return (
      <div className={`flex items-center justify-center text-default-400 ${className}`}>
        <p>Нет содержимого для отображения</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-h-[65vh] overflow-auto p-4 min-h-0 ${className}`}>
      <div
        className="docx-viewer-content max-w-full whitespace-normal"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
