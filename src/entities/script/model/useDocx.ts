import { useContext } from 'react';
import { DocxContext } from './context';

export const useDocx = () => {
  const context = useContext(DocxContext);
  if (!context) {
    throw new Error('useDocx must be used within a DocxProvider');
  }
  return context;
};
