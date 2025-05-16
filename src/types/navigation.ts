export type BreadcrumbItem = {
  path: string;
  labelKey: string;
  labelParams?: string[];
};

export interface BreadcrumbContextType {
  breadcrumbNavigation: BreadcrumbItem[];
  isNavgiateToParentOnly: boolean;
  setNavgiateToParentOnly: (value: boolean) => void,
  startBreadcrumb: (path: string, labelKey: string, paramKey?: string | string[]) => void;
  appendBreadcrumb: (path: string, labelKey: string, paramKey?: string | string[]) => void;
}
