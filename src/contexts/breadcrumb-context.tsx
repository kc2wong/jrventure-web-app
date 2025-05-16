import { createContext } from 'react';
import { BreadcrumbContextType } from '../types/navigation';

export const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbNavigation: [],
  startBreadcrumb: () => {},
  appendBreadcrumb: () => {},
  isNavgiateToParentOnly: false,
  setNavgiateToParentOnly: () => {},
});
