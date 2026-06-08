import { useRef, type FC } from 'react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { renderAsync } from 'docx-preview';
import { useDocx } from '@/entities/script/model/useDocx';

export const InputScriptFile: FC = () => {
  const { setDocxData, setFileContent } = useDocx();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Пожалуйста, выберите файл в формате .docx');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        setFileContent(arrayBuffer);

        // Рендерим DOCX во временный контейнер, чтобы получить HTML
        const tempContainer = document.createElement('div');
        await renderAsync(arrayBuffer, tempContainer, undefined, {
          className: 'docx-content', // префикс CSS-классов
          inWrapper: false, // без обёртки-страницы
          ignoreWidth: true,
          ignoreHeight: true,
          renderHeaders: false,
          renderFooters: false,
          renderFootnotes: false,
          renderEndnotes: false,
        });

        const htmlString = tempContainer.innerHTML;
        setDocxData(htmlString, file.name);
        navigate('/call/phonenumber');
      } catch (error) {
        console.error('Ошибка парсинга файла:', error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex items-center justify-center grow">
      <Button onPress={triggerFileInput}>📂 Загрузить .docx файл</Button>
      <input type="file" accept=".docx" onChange={handleFileUpload} ref={fileInputRef} hidden />
    </div>
  );
};
