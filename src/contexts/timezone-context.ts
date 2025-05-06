import { createContext } from 'react';

type TimezoneContextType = {
  timezone: string;
  setTimezone: (tz: string) => void;
};

export const TimezoneContext = createContext<TimezoneContextType>({
  timezone: 'UTC',
  setTimezone: function (_tz: string): void {},
});
