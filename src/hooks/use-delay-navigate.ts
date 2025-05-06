import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from './use-message';

export const useNavigateWithSpinner = () => {
  const navigate = useNavigate();
  const { showSpinner, stopSpinner } = useMessage();

  const navigateWithSpinner = useCallback(
    (path: string, delay = 500, state?: any) => {
      showSpinner();
      setTimeout(() => {
        navigate(path, { state: state });
        stopSpinner();
      }, delay);
    },
    [navigate, showSpinner, stopSpinner],
  );

  return navigateWithSpinner;
};
