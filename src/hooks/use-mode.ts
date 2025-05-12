import { useLocation } from 'react-router-dom';

// type Mode = 'list' | 'add' | 'edit' | 'view';

export const useMode = (customMode?: string[]): string | undefined => {
  const { pathname } = useLocation();

  const cleanedPath = pathname.replace(/\/$/, ''); // remove trailing slash
  const lastSegment = cleanedPath.split('/').pop() ?? '';

  if (customMode && customMode.includes(lastSegment)) {
    return lastSegment;
  }
  switch (lastSegment) {
    case 'add':
      return 'add';
    case 'edit':
      return 'edit';
    case 'view':
      return 'view';
    default:
      return 'list';
  }
};
