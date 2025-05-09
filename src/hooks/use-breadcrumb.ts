import { useContext, useEffect } from 'react';
import { BreadcrumbContextType } from '../types/navigation';
import { BreadcrumbContext } from '../contexts/breadcrumb-context';
import { useLocation } from 'react-router-dom';

const usePageNavigation = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('usePageElementNavigation must be used within a PageElementNavigationProvider');
  }
  return context;
};

export const useBreadcrumb = () => {
  const navigationCtx = usePageNavigation();
  const location = useLocation();

  const startBreadcrumb = (labelKey: string) => {
    useEffect(() => {
      navigationCtx.startBreadcrumb(location.pathname, labelKey);
    }, [navigationCtx, labelKey]);
  };

  const appendBreadcrumb = (labelKey: string, paramKey?: string | string[]) => {
    useEffect(() => {
      navigationCtx.appendBreadcrumb(location.pathname, labelKey, paramKey);
    }, [navigationCtx, labelKey, paramKey]);
  };

  return {
    breadcrumbNavigation: navigationCtx.breadcrumbNavigation,
    startBreadcrumb,
    appendBreadcrumb,
  };
};
