import { createContext } from 'react';

export type Theme = 'playful' | 'light' | 'dark';

interface ThemedAppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemedAppContext = createContext<ThemedAppContextType>({
  theme: 'light',
  setTheme: () => {},
});
