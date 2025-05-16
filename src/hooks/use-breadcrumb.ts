import { useCallback, useContext } from 'react';
import { BreadcrumbContext } from '../contexts/breadcrumb-context';
import { useLocation } from 'react-router-dom';


export const useBreadcrumb = () => {

  const navigationCtx = useContext(BreadcrumbContext);
  if (!navigationCtx) {
    throw new Error('usePageElementNavigation must be used within a PageElementNavigationProvider');
  }
  const location = useLocation();

  const useStartBreadcrumb = useCallback((labelKey: string) => {
    navigationCtx.startBreadcrumb(location.pathname, labelKey);
  }, [navigationCtx]);

  const useAppendBreadcrumb = useCallback((labelKey: string, paramKey?: string | string[]) => {
    navigationCtx.appendBreadcrumb(location.pathname, labelKey, paramKey);
  }, [navigationCtx]);

  return {
    breadcrumbNavigation: navigationCtx.breadcrumbNavigation,
    isNavgiateToParentOnly: navigationCtx.isNavgiateToParentOnly,
    setNavgiateToParentOnly: navigationCtx.setNavgiateToParentOnly,
    useStartBreadcrumb,
    useAppendBreadcrumb,
  };
};