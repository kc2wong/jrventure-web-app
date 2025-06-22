import { useRef } from 'react';
import { FormDirtinessContext } from '@contexts/form-dirtiness-context';

export const FormDirtinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFormDirty = useRef(false); // Use useRef instead of useState

  const isDirty = () => {
    return isFormDirty.current;
  };

  const setIsDirty = (value: boolean) => {
    isFormDirty.current = value;
  };

  return (
    <FormDirtinessContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </FormDirtinessContext.Provider>
  );
};
