import React, { createContext, useContext, useState } from 'react';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { createLightTheme, BrandVariants, Theme as FuiTheme } from '@fluentui/react-components';

export type Theme = 'playful' | 'light' | 'dark';

interface ThemedAppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemedAppContext = createContext<ThemedAppContextType>({
  theme: 'light',
  setTheme: () => {},
});

// Define your custom brand colors
const playfulBrand: BrandVariants = {
  10: '#fff7f0',
  20: '#ffebd9',
  30: '#ffd5b3',
  40: '#ffb784',
  50: '#ff914d',
  60: '#ff7000', // primary color
  70: '#e65f00',
  80: '#cc5000',
  90: '#b34400',
  100: '#993800',
  110: '#802d00',
  120: '#662200',
  130: '#4d1900',
  140: '#331000',
  150: '#1a0800',
  160: '#0d0400',
};

// Create a new light theme with your brand
const playfulTheme = {
  ...createLightTheme(playfulBrand),

  // Override global color tokens or component styles
  colorNeutralForeground1: '#333333',
  colorBrandForeground1: playfulBrand[60],
  fontFamilyBase: '"Comic Sans MS", "Fredoka", cursive, sans-serif',
  fontSizeBase300: '14px',
  fontSizeBase400: '16px',
  fontSizeBase500: '18px',

  // Optional: Make headings a bit playful
  fontFamilyHeading: '"Fredoka", "Comic Sans MS", cursive, sans-serif',
};

const themeConfigs: Record<Theme, FuiTheme> = {
  playful: playfulTheme,
  light: webLightTheme,
  dark: webDarkTheme,
};

export const ThemedAppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemedAppContext.Provider value={{ theme, setTheme }}>
      <FluentProvider theme={themeConfigs[theme]}>{children}</FluentProvider>
    </ThemedAppContext.Provider>
  );
};

export const useTheme = (): ThemedAppContextType => {
  const context = useContext(ThemedAppContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemedAppProvider');
  }
  return context;
};
