import {
  Breadcrumb as FluentUiBreadcrumb,
  BreadcrumbItem as FluentUiBreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
} from '@fluentui/react-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationHelpers } from '../hooks/use-delay-navigate';
import { constructMessage } from '../utils/string-util';
import { MenuItem } from '../models/login';
import { getMenuItemIdByPath } from '../pages/common';
import { useBreadcrumb } from '../hooks/use-breadcrumb';

// Recursive function to find the path
const findPath = (
  tree: MenuItem,
  targetId: string,
  path: MenuItem[] = [],
): MenuItem[] | undefined => {
  const currentPath = [...path, tree];
  if (tree.id === targetId) {
    return currentPath;
  }
  if (tree.children) {
    for (const child of tree.children) {
      const result = findPath(child, targetId, currentPath);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
};

type BreadcrumbNavigationProps = {
  menuData: MenuItem;
  confirmationPrompt?: (action: () => void) => void;
};

export const Breadcrumb: React.FC<BreadcrumbNavigationProps> = ({
  menuData,
  confirmationPrompt,
}: BreadcrumbNavigationProps) => {
  // const location = useLocation();
  const { t } = useTranslation();
  const { navigate } = useNavigationHelpers();
  const { breadcrumbNavigation: pageNavigation } = useBreadcrumb();

  // Check if need to prepend extra elements
  const rootPathElement = pageNavigation[0]?.path;
  const menuItemId = rootPathElement ? getMenuItemIdByPath(rootPathElement) : undefined;
  const menuPathIds = menuItemId
    ? (findPath(menuData, menuItemId) ?? [])
        .map((e) => e.id)
        // remove 'root'
        .slice(1)
    : [];

  const lastBreadcrumbItem =
    pageNavigation.length > 0
      ? pageNavigation[pageNavigation.length - 1]
      : menuPathIds[menuPathIds.length - 1];
  return (
    <FluentUiBreadcrumb aria-label="breadcrubm">
      {menuPathIds.map((id) => {
        const label = t(`system.menu.${id}`);
        return (
          <React.Fragment key={id}>
            <FluentUiBreadcrumbItem>
              {lastBreadcrumbItem === id ? (
                <BreadcrumbButton current>
                  <span>&nbsp;{label}&nbsp;</span>
                </BreadcrumbButton>
              ) : (
                <span>&nbsp;{label}&nbsp;</span>
              )}
            </FluentUiBreadcrumbItem>
            {lastBreadcrumbItem === id ? <></> : <BreadcrumbDivider />}
          </React.Fragment>
        );
      })}
      {pageNavigation.map((node, idx) => (
        <React.Fragment key={node.labelKey}>
          <FluentUiBreadcrumbItem>
            <BreadcrumbButton
              current={lastBreadcrumbItem === node}
              onClick={() => {
                const delta = -(pageNavigation.length - idx - 1);
                const navigation = () => navigate(delta);
                if (confirmationPrompt) {
                  confirmationPrompt(navigation);
                } else {
                  navigation();
                }
              }}
            >
              <span>
                &nbsp;{constructMessage(t, node.labelKey, node.labelParams)}
                &nbsp;
              </span>
            </BreadcrumbButton>
          </FluentUiBreadcrumbItem>
          {lastBreadcrumbItem === node ? <></> : <BreadcrumbDivider />}
        </React.Fragment>
      ))}
    </FluentUiBreadcrumb>
  );
};
