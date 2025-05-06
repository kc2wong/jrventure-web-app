import { useContext } from 'react';
import { DialogContext, DialogContextType } from '../contexts/dialog-context';

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogContextProvider');
  }
  return context;
};