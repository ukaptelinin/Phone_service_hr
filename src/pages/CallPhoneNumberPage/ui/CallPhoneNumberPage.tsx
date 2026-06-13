import { useDocx } from '@/entities/script/model/useDocx';
import { DocxViewer } from '@/features/DoxViewer';
import { InputStatusBlock } from '@/features/InputStatusBlock';
import { ScriptSwitch } from '@/features/ScriptSwitch/ui/ScriptSwitch';
import { ScriptBlockViewer } from '@/features/ScriptViewer';
import { PhoneNumberPageNavbar } from '@/widgets/PhoneNumberPageNavbar';
import { Button } from '@heroui/react';
import type { FC } from 'react';

export const CallPhoneNumberPage: FC = () => {
  const { fileData, scriptBlockKey, scriptMode } = useDocx();
  return (
    <div className="flex w-full h-full overflow-hidden gap-1 p-1">
      {/* Левый блок: 25% ширины */}
      <div className="flex flex-col w-1/4 min-h-0 gap-1">
        {/* Верхний блок: 30% высоты левой колонки */}
        <div className="flex-[30] shrink-0 rounded-lg shadow-md ring-1 ring-gray-200/50">
          <div className="flex flex-col items-center max-w-xl gap-4">
            <h1>+79291235467</h1>
            <Button className="bg-green-500">Позвонить</Button>
          </div>
        </div>
        {/* Нижний блок: оставшееся пространство */}
        <div className="flex-[70] min-h-0 rounded-lg shadow-md ring-1 ring-gray-200/50" />
      </div>

      {/* Правый блок: 75% ширины */}
      {/* Правый блок */}
      <div className="flex flex-col w-3/4 min-h-0 gap-1">
        {/* Верхний блок: пропорция 55 */}
        <div className="flex flex-col flex-55 min-h-0 rounded-lg shadow-md ring-1 ring-gray-200/50">
          <PhoneNumberPageNavbar />
          {scriptMode ? (
            <DocxViewer fileData={fileData} />
          ) : (
            <ScriptBlockViewer blockKey={scriptBlockKey} />
          )}
          {scriptMode ? null : (
            <div className="mt-auto shrink-0">
              <ScriptSwitch />
            </div>
          )}
        </div>
        {/* Нижний блок: пропорция 45 */}
        <div className="flex flex-col flex-45 min-h-0 rounded-lg shadow-md ring-1 ring-gray-200/50 overflow-hidden">
          <InputStatusBlock />
        </div>
      </div>
    </div>
  );
};
