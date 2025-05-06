import { useContext } from 'react';
import { MessageContextType, MessageContext } from '../contexts/message-context';

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
