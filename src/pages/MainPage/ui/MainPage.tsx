import type { FC } from 'react';
import { Navbar } from '../../../widgets/Navbar';

interface Props {
  children?: React.ReactNode;
}

export const MainPage: FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 min-h-0 w-full">{children}</main>
      {/*<footer className="w-full flex items-center justify-center py-3 h-6">PHONE SERVICE</footer> */}
    </div>
  );
};
