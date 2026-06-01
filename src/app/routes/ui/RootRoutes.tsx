import { CallPage } from '@/pages/CallPage';
import { CallPhoneNumberPage } from '@/pages/CallPhoneNumberPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { OptionsPage } from '@/pages/OptionsPage';
import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

export const RootRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/call" replace />} />
      <Route path="/call" element={<CallPage />} />
      <Route path="/call/phonenumber" element={<CallPhoneNumberPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/options" element={<OptionsPage />} />
    </Routes>
  );
};
