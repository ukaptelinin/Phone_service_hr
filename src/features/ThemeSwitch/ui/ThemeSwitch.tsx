import clsx from 'clsx';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import { useTheme } from '@heroui/use-theme'; // Импортируем useTheme из отдельного пакета

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        theme === 'light' ? 'bg-gray-200' : 'bg-gray-600',
        className,
      )}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span
        className={clsx(
          'inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white transition-transform',
          theme === 'light' ? 'translate-x-1' : 'translate-x-5',
        )}
      >
        {theme === 'light' ? (
          <SunIcon className="h-3 w-3 text-yellow-500" />
        ) : (
          <MoonIcon className="h-3 w-3 text-gray-700" />
        )}
      </span>
    </button>
  );
};
