import type { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RootRoutes } from './routes/ui/RootRoutes';
import { MainPage } from '../pages/MainPage';
import { DocxProvider } from '@/entities/script/model/context';

export const App: FC = () => (
  <BrowserRouter>
    <DocxProvider>
      <MainPage>
        <RootRoutes />
      </MainPage>
    </DocxProvider>
  </BrowserRouter>
);
