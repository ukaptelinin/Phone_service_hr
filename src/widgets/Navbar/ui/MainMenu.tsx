import { useState } from 'react';
import { NavbarItem } from '@heroui/navbar';
import { Link } from '@heroui/react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom'; // если используется React Router

export const MainMenu: FC = () => {
  // первый пункт активен по умолчанию
  const [activePath, setActivePath] = useState('/call');
  const navigate = useNavigate();

  const menuItems = [
    { path: '/call', label: 'Прозвон' },
    { path: '/history', label: 'Контакты' },
    { path: '/options', label: 'Отчеты' },
  ];

  const handleClick = (path: string) => {
    setActivePath(path);
    navigate(path); // переход без перезагрузки
  };

  return (
    <>
      {menuItems.map((item) => (
        <NavbarItem key={item.path}>
          <Link
            className={`px-4 text-foreground ${
              activePath === item.path ? 'text-yellow-500 font-bold' : ''
            }`}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              handleClick(item.path);
            }}
          >
            {item.label}
          </Link>
        </NavbarItem>
      ))}
    </>
  );
};