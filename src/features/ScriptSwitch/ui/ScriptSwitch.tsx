import { Button, ButtonGroup } from '@heroui/react';
import type { FC } from 'react';

export const ScriptSwitch: FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <ButtonGroup size="sm" variant="tertiary">
        <Button>Скрипт</Button>
        <Button>
          <ButtonGroup.Separator />
          KPI
        </Button>
        <Button>
          <ButtonGroup.Separator />О компании
        </Button>
        <Button>
          <ButtonGroup.Separator />
          Не принимает
        </Button>
      </ButtonGroup>
    </div>
  );
};
