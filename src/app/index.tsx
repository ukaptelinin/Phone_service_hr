import type { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RootRoutes } from './routes/ui/RootRoutes';
import { MainPage } from '../pages/MainPage';

export const App: FC = () => (
  <BrowserRouter>
    <MainPage>
      <RootRoutes />
    </MainPage>
  </BrowserRouter>
);
