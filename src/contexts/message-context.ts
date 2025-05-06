import { createContext } from 'react';
import { ToastMessage } from '../types/toast';

export interface MessageContextType {
  showSpinner: () => void;
  stopSpinner: () => void;
  dispatchMessage: (message: Omit<ToastMessage, 'id'>) => void;
}

export const MessageContext = createContext<MessageContextType>({
  showSpinner: () => {},
  stopSpinner: () => {},
  dispatchMessage: () => {},
});
