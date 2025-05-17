// navigation/provider.tsx

import React, { useState } from 'react';
import { isEqual } from '../utils/object-util';
import { BreadcrumbItem, BreadcrumbContextType } from '../types/navigation';
import { BreadcrumbContext } from '../contexts/breadcrumb-context';
import { asArray } from '../utils/array-util';

const emptyArray: string[] = [];

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);
  const [isNavgiateToParentOnly, setNavgiateToParentOnly] = useState(false);

  const popPageNavigationTill = (labelKey: string, labelParam?: string[]): boolean => {
    let newPageElement: BreadcrumbItem[];
    const existingIndex = breadcrumbPath.findIndex((e) => e.labelKey === labelKey);
    // label not found in existing path
    if (existingIndex < 0) {
      return false;
    }

    if (existingIndex === breadcrumbPath.length - 1) {
      if (!isEqual(breadcrumbPath[existingIndex].labelParams ?? [], labelParam ?? [])) {
        newPageElement = [...breadcrumbPath];
        newPageElement[existingIndex].labelParams = labelParam;
        setBreadcrumbPath(newPageElement);
      }
      return true;
    } else {
      newPageElement = breadcrumbPath.slice(0, existingIndex + 1);
      if (newPageElement[newPageElement.length - 1]) {
        newPageElement[newPageElement.length - 1].labelParams = labelParam;
      }
      setBreadcrumbPath(newPageElement);
      return true;
    }
  };

  const startPageNavigation = (path: string, labelKey: string, labelParams?: string[]) => {
    setBreadcrumbPath([{ path, labelKey, labelParams }]);
  };

  const appendPageNavigation = (
    // navigate: NavigateFunction,
    path: string,
    labelKey: string,
    labelParams?: string[],
  ) => {
    if (breadcrumbPath[breadcrumbPath.length - 1]?.labelKey !== labelKey) {
      const newPageElement = [...breadcrumbPath];
      newPageElement.push({ path, labelKey, labelParams });
      setBreadcrumbPath(newPageElement);
    }
  };

  const startBreadcrumb = (path: string, labelKey: string, paramKey?: string | string[]): void => {
    if (!popPageNavigationTill(labelKey)) {
      const paramKeyArray = paramKey ? asArray(paramKey)! : emptyArray;
      startPageNavigation(path, labelKey, paramKeyArray);
      setNavgiateToParentOnly(false);
    }
  };

  const appendBreadcrumb = (path: string, labelKey: string, paramKey?: string | string[]): void => {
    const paramKeyArray = paramKey ? asArray(paramKey)! : emptyArray;
    if (!popPageNavigationTill(labelKey, paramKeyArray)) {
      appendPageNavigation(path, labelKey, paramKeyArray);
    }
  };

  const value: BreadcrumbContextType = {
    breadcrumbNavigation: breadcrumbPath,
    startBreadcrumb,
    appendBreadcrumb,
    isNavgiateToParentOnly,
    setNavgiateToParentOnly
  };

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
};
