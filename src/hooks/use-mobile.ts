import { useMediaQuery } from 'usehooks-ts';

export const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 600px)');
};
