import { useContext } from 'react';
import { FormDirtinessContext } from '@contexts/form-dirtiness-context';

export const useFormDirtiness = () => {
  const context = useContext(FormDirtinessContext);
  if (!context) {
    throw new Error('useFormDirtiness must be used within a FormDirtinessProvider');
  }

  const markDirty = () => {
    if (context.isDirty() !== true) {
      context.setIsDirty(true);
    }
  };

  const resetDirty = () => {
    if (context.isDirty() !== false) {
      context.setIsDirty(false);
    }
  };

  return {
    isDirty: context.isDirty,
    markDirty,
    resetDirty,
  };
};
