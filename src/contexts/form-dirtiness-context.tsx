import { createContext } from 'react';

interface FormDirtinessContextType {
  isDirty: () => boolean;
  setIsDirty: (value: boolean) => void;
}

export const FormDirtinessContext = createContext<FormDirtinessContextType | undefined>(undefined);
