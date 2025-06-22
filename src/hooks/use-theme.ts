import { useContext } from 'react';
import { ThemedAppContext } from '@contexts/theme';

export const useTheme = () => {
  const context = useContext(ThemedAppContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemedAppProvider');
  }
  return context;
};

