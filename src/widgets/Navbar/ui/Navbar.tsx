import type { FC } from 'react';
import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/navbar';
import { Link } from '@heroui/react';
import { ThemeSwitch } from '../../../features/ThemeSwitch';
import { PhoneIcon } from '@heroicons/react/20/solid';
import { MainMenu } from './MainMenu';

export const Navbar: FC = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="flex flex-row">
      <NavbarContent className="flex flex-1 justify-between">
        <NavbarBrand className="gap-3 max-w-fit pl-4">
          <Link className="flex justify-start items-center gap-1 text-foreground" href="/">
            <PhoneIcon className="w-8 h-8 text-primary" />
            <p className="font-bold text-inherit px-4">PHONE SERVICE</p>
          </Link>
        </NavbarBrand>
        <MainMenu />
        <NavbarItem className="flex items-center grow justify-end pr-4">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
