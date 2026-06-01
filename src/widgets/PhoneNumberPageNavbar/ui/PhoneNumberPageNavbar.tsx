import type { FC } from 'react';
import { Navbar as HeroUINavbar, NavbarContent, NavbarItem } from '@heroui/navbar';
import { Link } from '@heroui/react';
export const PhoneNumberPageNavbar: FC = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="flex flex-row">
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
    </HeroUINavbar>
  );
};
