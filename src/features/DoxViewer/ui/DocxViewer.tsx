import React, { useEffect, useRef, useState, useMemo } from 'react';
import { renderAsync, type Options } from 'docx-preview';
import styles from './docx-viewer.module.css';

interface DocxViewerProps {
  fileData: ArrayBuffer | Blob | null;
  className?: string;
  options?: Partial<Options>;
}

const defaultOptions: Options = {
  className: 'docx-wrapper',
  inWrapper: true,
  ignoreWidth: false,
  ignoreHeight: false,
  ignoreFonts: false,
  breakPages: true,
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

// ─── пустой объект-константа, чтобы дефолт не создавался заново ───
const EMPTY_OPTIONS: Partial<Options> = {};

export const DocxViewer: React.FC<DocxViewerProps> = ({
  fileData,
  className = '',
  // ▸ FIX 1: дефолт — стабильная константа, а не литерал {}
  options = EMPTY_OPTIONS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ▸ FIX 2: стабилизируем ссылку на options через JSON-сериализацию.
  //   useMemo пересчитается только если СОДЕРЖИМОЕ options реально изменилось.
  const stableOptionsKey = JSON.stringify(options);
  const mergedOptions = useMemo<Options>(
    () => ({ ...defaultOptions, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stableOptionsKey],
  );

  // ▸ FIX 3: храним предыдущий fileData, чтобы не перерисовывать тот же файл
  const prevFileDataRef = useRef<ArrayBuffer | Blob | null>(null);
  const prevOptionsKeyRef = useRef<string>('');

  useEffect(() => {
    if (!fileData || !containerRef.current) return;

    // ── Если fileData и options не изменились — ничего не делаем ──
    if (prevFileDataRef.current === fileData && prevOptionsKeyRef.current === stableOptionsKey) {
      return;
    }
    prevFileDataRef.current = fileData;
    prevOptionsKeyRef.current = stableOptionsKey;

    // ▸ FIX 4: используем флаг отмены, чтобы устаревший рендер
    //   не перезаписывал результат нового
    let cancelled = false;

    const render = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ▸ FIX 5: очищаем контейнер только ПЕРЕД новым рендером,
        //   а не при каждом useEffect-вызове
        const container = containerRef.current!;
        container.innerHTML = '';

        await renderAsync(fileData, container, undefined, mergedOptions);

        // Если за время рендера пришёл новый вызов — игнорируем результат
        if (cancelled) return;
      } catch (err) {
        if (cancelled) return;
        console.error('DOCX render error:', err);
        setError(err instanceof Error ? err.message : 'Не удалось отобразить документ');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    render();

    // cleanup: помечаем предыдущий рендер как отменённый
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
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      )}
      <div
        ref={containerRef}
        className={styles.container}
        style={{
          width: '100%',
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '1rem',
        }}
      />
    </div>
  );
};
