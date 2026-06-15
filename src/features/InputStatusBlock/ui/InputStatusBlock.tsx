import { Button, Form, TextArea, TextField } from '@heroui/react';
import type { FC } from 'react';
import { InputStatusRadioField } from './InputStatusRadioField';
import { useNavigate } from 'react-router-dom';

export const InputStatusBlock: FC = () => {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    navigate('/call');
  };

  return (
    <Form className="flex flex-col w-full h-full" onSubmit={onSubmit}>
      {/* Верхний блок: 65% высоты, без прокрутки, уменьшенные отступы */}
      <div className="h-[65%] min-h-0 rounded-t-lg *:gap-y-1">
        <InputStatusRadioField />
      </div>

      {/* Нижний блок: 35% высоты */}
      <div className="h-[35%] min-h-0 rounded-b-lg flex flex-row items-stretch gap-2 p-2">
        <div className="grow min-h-0">
          <TextField name="comment" className="w-full h-full py-1">
            <TextArea
              placeholder="Введите комментарий"
              className="w-full h-full resize-none bg-stone-200 "
            />
          </TextField>
        </div>
        <Button type="submit" className="self-center bg-green-500">
          Отправить
        </Button>
      </div>
    </Form>
  );
};
