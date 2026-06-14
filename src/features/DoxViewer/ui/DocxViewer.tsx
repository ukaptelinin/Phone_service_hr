import React, { useEffect, useRef, useState, useMemo } from 'react';
import { renderAsync, type Options } from 'docx-preview';
import styles from './docx-viewer.module.css';

interface DocxViewerProps {
  fileData: ArrayBuffer | Blob | null;
  className?: string;
  options?: Partial<Options>;
}

const defaultOptions: Options = {
  className: 'docx-viewer-content',
  inWrapper: false, // ← НЕ создаём обёртку с серым фоном
  ignoreWidth: true, // ← секция растягивается по ширине контейнера
  ignoreHeight: true, // ← убираем фиксированную высоту страницы
  ignoreFonts: false,
  breakPages: false, // ← сплошной поток без разрывов страниц
  ignoreLastRenderedPageBreak: true,
  renderHeaders: true,
  renderFooters: true,
  renderFootnotes: true,
  renderEndnotes: true,
  experimental: false,
  trimXmlDeclaration: true,
  useBase64URL: false,
  renderChanges: false,
  debug: false,
  hideWrapperOnPrint: false,
  renderComments: false,
  renderAltChunks: false,
};

const EMPTY_OPTIONS: Partial<Options> = {};

/**
 * После рендера — полностью убираем инлайн-стили со всех секций,
 * оставляя только контент.
 */
function cleanupDocxStyles(container: HTMLElement) {
  // Если всё же появился wrapper (на случай если inWrapper вернётся)
  const wrapper = container.querySelector<HTMLElement>('.docx-wrapper, .docx-viewer-content');
  if (wrapper) {
    wrapper.removeAttribute('style');
  }

  // Убираем ВСЕ инлайн-стили с секций
  const sections = container.querySelectorAll<HTMLElement>('section.docx');
  sections.forEach((section) => {
    section.removeAttribute('style');
  });
}

export const DocxViewer: React.FC<DocxViewerProps> = ({
  fileData,
  className = '',
  options = EMPTY_OPTIONS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stableOptionsKey = JSON.stringify(options);
  const mergedOptions = useMemo<Options>(
    () => ({ ...defaultOptions, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stableOptionsKey],
  );

  const prevFileDataRef = useRef<ArrayBuffer | Blob | null>(null);
  const prevOptionsKeyRef = useRef<string>('');

  useEffect(() => {
    if (!fileData || !containerRef.current) return;

    if (prevFileDataRef.current === fileData && prevOptionsKeyRef.current === stableOptionsKey) {
      return;
    }
    prevFileDataRef.current = fileData;
    prevOptionsKeyRef.current = stableOptionsKey;

    let cancelled = false;

    const render = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const container = containerRef.current!;
        container.innerHTML = '';

        await renderAsync(fileData, container, undefined, mergedOptions);

        if (cancelled) return;

        // Убираем все инлайн-стили, созданные библиотекой
        cleanupDocxStyles(container);
      } catch (err) {
        if (cancelled) return;
        console.error('DOCX render error:', err);
        setError(err instanceof Error ? err.message : 'Не удалось отобразить документ');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [fileData, mergedOptions, stableOptionsKey]);

  if (!fileData) {
    return <div className={`${styles.empty} ${className}`}>Нет файла</div>;
  }

  if (error) {
    return <div className={`${styles.error} ${className}`}>Ошибка: {error}</div>;
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      )}
      <div ref={containerRef} className={styles.container} />
    </div>
  );
};
