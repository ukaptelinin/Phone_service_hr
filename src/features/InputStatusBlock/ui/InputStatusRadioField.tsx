import { RadioGroup } from '@heroui/react';
import type { FC } from 'react';
import { InputStatusBlockItem } from './InputStatusBlockItem';

interface StatusItem {
  title: string;
  color: string;
  value: string;
}

const statusItems: StatusItem[] = [
  { title: 'Лид принят ОКК', color: 'border-green-500', value: 'lid_accepted' },
  { title: 'Заполнить лид', color: 'border-blue-500', value: 'fill_lid' },
  { title: 'Перезвонить', color: 'border-blue-500', value: 'recall' },
  { title: 'Отказ ЛПР: уже купили', color: 'border-blue-500', value: 'refuse_bought' },
  { title: 'Отказ ЛПР: не подходит KPI', color: 'border-blue-500', value: 'refuse_kpi' },
  { title: 'Отказ ЛПР: Неактуально', color: 'border-blue-500', value: 'refuse_irrelevant' },
  { title: 'Отказ ЛПР: бросил трубку', color: 'border-blue-500', value: 'refuse_hanged' },
  {
    title: 'Отказ ЛПР: отложил на неопределенный срок',
    color: 'border-blue-500',
    value: 'refuse_postponed',
  },
  {
    title: 'Отказ ЛПР: был интерес, передумал',
    color: 'border-blue-500',
    value: 'refuse_changed_mind',
  },
  { title: 'В недозвон', color: 'border-gray-500', value: 'no_answer' },
  { title: 'Автоответчик-секретарь', color: 'border-gray-500', value: 'auto_secretary' },
  { title: 'Некорректный номер', color: 'border-gray-500', value: 'invalid_number' },
  { title: 'Лид не принят ОКК', color: 'border-red-500', value: 'lid_rejected' },
];

export const InputStatusRadioField: FC = () => {
  return (
    <RadioGroup
      defaultValue="lid_accepted"
      name="plan"
      className="grid h-full grid-cols-1 gap-x-1 gap-y-0.5 p-1 md:grid-cols-2 lg:grid-cols-4 content-start"
    >
      {statusItems.map((item) => (
        <InputStatusBlockItem
          key={item.value}
          title={item.title}
          color={item.color}
          value={item.value}
        />
      ))}
    </RadioGroup>
  );
};
