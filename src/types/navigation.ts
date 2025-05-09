export type BreadcrumbItem = {
  path: string;
  labelKey: string;
  labelParams?: string[];
};

export interface BreadcrumbContextType {
  breadcrumbNavigation: BreadcrumbItem[];
  startBreadcrumb: (path: string, labelKey: string) => void;
  appendBreadcrumb: (path: string, labelKey: string, paramKey?: string | string[]) => void;
}
