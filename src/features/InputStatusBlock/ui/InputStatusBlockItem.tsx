import { Label, Radio } from '@heroui/react';
import type { FC } from 'react';

interface StatusBlockItemsProps {
  title: string;
  color: string;
  value: string;
}

export const InputStatusBlockItem: FC<StatusBlockItemsProps> = ({ title, color, value }) => {
  return (
    <Radio value={value} className="items-center!">
      <Radio.Control className={`border-2 ${color} shrink-0`}>
        <Radio.Indicator />
      </Radio.Control>
      <Radio.Content className="flex-1">
        <Label className="whitespace-normal wrap-break-word max-w-[22ch]">{title}</Label>
      </Radio.Content>
    </Radio>
  );
};
