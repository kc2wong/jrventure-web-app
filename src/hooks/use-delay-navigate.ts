import { useCallback } from 'react';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';
import { useMessage } from './use-message';

export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const { showSpinner, stopSpinner } = useMessage();

  const navigateWithSpinner = useCallback(
    (to: To, options?: NavigateOptions, delay = 500) => {
      showSpinner();
      setTimeout(() => {
        navigate(to, options);
        stopSpinner();
      }, delay);
    },
    [navigate, showSpinner, stopSpinner]
  );

  const wrappedNavigate = useCallback(
    (to: To | number, options?: NavigateOptions): void => {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        navigate(to, options);
      }
    },
    [navigate]
  );

  return {
    navigate: wrappedNavigate,
    navigateWithSpinner,
  };
};