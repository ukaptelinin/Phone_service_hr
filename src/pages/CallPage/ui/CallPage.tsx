import { InputScriptFile } from '@/features/InputScriptFile';
import type { FC } from 'react';

export const CallPage: FC = () => {
  return (
    <div className="flex items-center w-full h-full">
      <InputScriptFile />
    </div>
  );
};
