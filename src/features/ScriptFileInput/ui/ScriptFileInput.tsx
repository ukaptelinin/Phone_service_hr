import { useRef, type FC } from 'react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';
import { useDocx } from '@/entities/script/model/useDocx';

export const ScriptFileInput: FC = () => {
  const { setDocxData } = useDocx();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка расширения
    if (!file.name.endsWith('.docx')) {
      alert('Пожалуйста, выберите файл в формате .docx');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        // Конвертируем .docx в HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxData(result.value, file.name);
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
