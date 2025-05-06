import { useState } from 'react';
import { TimezoneContext } from '../contexts/timezone-context';

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezone] = useState('UTC'); // fallback until user logs in

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
};
