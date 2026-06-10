import { Button, Form, TextArea, TextField } from '@heroui/react';
import type { FC } from 'react';
import { InputStatusRadioField } from './InputStatusRadioField';

export const InputStatusBlock: FC = () => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  };
  return (
    <Form className="flex flex-col w-full h-full" onSubmit={onSubmit}>
      {/* Синий блок: занимает 3/ высоты родителя, но при переполнении – прокрутка */}
      <div className="flex-3 min-h-0  rounded-t-lg overflow-y-auto">
        <InputStatusRadioField />
      </div>
      <div className="flex-2 rounded-b-lg flex flex-row items-stretch gap-2 p-2">
        <div className="grow">
          <TextField name="comment" className="w-full h-full">
            <TextArea placeholder="Введите комментарий" className="w-full h-full resize-none" />
          </TextField>
        </div>
        <Button type="submit" className="self-center bg-green-500">
          Отправить
        </Button>
      </div>
    </Form>
  );
};
