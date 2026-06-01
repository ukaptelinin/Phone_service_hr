import { useDocx } from '@/entities/script/model/useDocx';
import { ScriptSwitch } from '@/features/ScriptSwitch/ui/ScriptSwitch';
import { PhoneNumberPageNavbar } from '@/widgets/PhoneNumberPageNavbar';
import { Button } from '@heroui/react';
import type { FC } from 'react';

export const CallPhoneNumberPage: FC = () => {
  const { htmlContent, scriptBlocks } = useDocx();
  console.log(htmlContent);
  console.log(scriptBlocks);
  return (
    <div className="flex w-full h-full">
      {/* Левый блок: 25% ширины, синий фон */}
      <div className="flex flex-col w-1/4 h-full">
        {/* Верхний блок: 30% высоты левой колонки */}
        <div className="h-[30%] bg-blue-700">
          <div className="flex flex-col items-center max-w-xl gap-4">
            <h1>+79291235467</h1>
            <Button className="bg-green-500 px-6 py-2 rounded-lg w-32">Вызов</Button>
          </div>
        </div>
        {/* Нижний блок: оставшееся пространство (70%) */}
        <div className="grow bg-blue-300" /> {/* или любой другой цвет */}
      </div>

      {/* Правый блок: занимает оставшиеся 75% ширины, вертикальный flex */}
      <div className="flex flex-col w-3/4 h-full">
        {/* Верхний блок: растягивается на всё доступное место, оранжевый фон */}
        <div className="flex flex-col grow bg-amber-300">
          <PhoneNumberPageNavbar />
          <div className="mt-auto">
            <ScriptSwitch />
          </div>
        </div>
        {/* Нижний блок: 15% высоты родителя (правого блока), зелёный фон */}
        <div className="h-[25%] bg-emerald-500" />
      </div>
    </div>
  );
};
