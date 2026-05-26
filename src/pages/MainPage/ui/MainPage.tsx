import type { FC } from 'react';
import { Navbar } from '../../../widgets/Navbar';

interface Props {
  children?: React.ReactNode;
}

export const MainPage: FC<Props> = ({ children }) => {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 h-[calc(100vh-60px)]">{children}</main>
      <footer className="w-full flex items-center justify-center py-3 h-6">PHONE SERVICE</footer>
    </div>
  );
};
