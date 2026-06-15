import { type FC } from 'react';
import { Navbar as HeroUINavbar, NavbarContent, NavbarItem } from '@heroui/navbar';
import { Button, Link, Tooltip } from '@heroui/react';
import { useDocx } from '@/entities/script/model/useDocx';

export const PhoneNumberPageNavbar: FC = () => {
  const { scriptMode, toggleScriptMode } = useDocx();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="flex flex-row shrink-0">
      <NavbarContent className="flex justify-start gap-6">
        <NavbarItem>
          <Link className="px-4">Сценарий</Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="px-4">История</Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="px-4">Задачи</Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="pr-4 py-1">
          <Tooltip delay={0}>
            <Button size="sm" onClick={toggleScriptMode}>
              {scriptMode ? 'Новый стиль' : 'Старый стиль'}
            </Button>
            <Tooltip.Content showArrow placement="left">
              <Tooltip.Arrow />
              <p>Способ отображения скрипта</p>
            </Tooltip.Content>
          </Tooltip>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
