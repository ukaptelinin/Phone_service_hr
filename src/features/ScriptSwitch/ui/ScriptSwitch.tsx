import { useDocx } from '@/entities/script/model/useDocx';
import type { ScriptBlockKey } from '@/entities/script/types/types';
import { Button, ButtonGroup } from '@heroui/react';
import type { FC } from 'react';
import clsx from 'clsx';

// Определяем соответствие
type SectionKey = 'KPI:' | 'О компании' | 'Не принимает' | 'Скрипт';

const data: Record<SectionKey, string> = {
  'KPI:': 'KPI:',
  'О компании': 'О компании:',
  'Не принимает': 'Что клиент не принимает:',
  Скрипт: 'Красным выделены обязательные вопросы и предложения!',
};

export const ScriptSwitch: FC = () => {
  const { scriptBlockKey, selectScriptBlockKey } = useDocx(); // предположим, что функция называется selectScriptBlockKey

  const handleClick = (key: SectionKey) => {
    const fullKey = data[key] as ScriptBlockKey;

    selectScriptBlockKey(fullKey);
  };

  const buttons: SectionKey[] = ['Скрипт', 'KPI:', 'О компании', 'Не принимает'];

  return (
    <div className="flex flex-col gap-2">
      <ButtonGroup size="sm" variant="tertiary">
        {buttons.map((key, idx) => {
          const isActive = scriptBlockKey === data[key];
          return (
            <Button
              key={key}
              onClick={() => handleClick(key)}
              className={clsx(isActive && 'bg-gray-400')}
            >
              {idx > 0 && <ButtonGroup.Separator />}
              {key}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
};
