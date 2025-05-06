import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  makeStyles,
  Tree,
  TreeItem,
  TreeItemLayout,
  useRestoreFocusSource,
  useRestoreFocusTarget,
} from '@fluentui/react-components';
import { Dismiss24Regular, RowTripleFilled } from '@fluentui/react-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from '../models/login';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useFormDirty } from '../contexts/FormDirty';
import { useDialog } from '../hooks/use-dialog';
import { useMessage } from '../hooks/use-message';

const useStyles = makeStyles({ body: { paddingTop: '5px' } });

// Recursive tree renderer with typing for `TreeNode`
const TreeBranch: React.FC<{ t: TFunction; node: MenuItem; onLeafClick: (id: string) => void }> = ({
  t,
  node,
  onLeafClick,
}) => {
  const { isDirty } = useFormDirty();
  const { showDiscardChangeDialog } = useDialog();

  const getLabel = (id: string, defaultLabel: string) => {
    const label = t(id);
    return label === id ? defaultLabel : label;
  };

  const label = getLabel(`system.menu.${node.id}`, node.label);
  const children = node.children;
  return children && children.length > 0 ? (
    <TreeItem itemType="branch">
      <TreeItemLayout>{label}</TreeItemLayout>
      <Tree>
        {children.map((c) => (
          <TreeBranch key={c.id} node={c} onLeafClick={onLeafClick} t={t} />
        ))}
      </Tree>
    </TreeItem>
  ) : (
    <TreeItem key={node.id} itemType="leaf">
      <TreeItemLayout
        onClick={() => {
          if (isDirty()) {
            showDiscardChangeDialog({
              action: () => {
                onLeafClick(node.id);
              },
            });
          } else {
            onLeafClick(node.id);
          }
        }}
      >
        {label}
      </TreeItemLayout>
    </TreeItem>
  );
};

const Menu: React.FC<{ data: MenuItem; onMenuItemClick: (id: string) => void }> = ({
  data,
  onMenuItemClick,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Tree Component */}
      <Tree aria-label="mainMenu">
        {(data.children ?? []).map((branch) => (
          <TreeBranch key={branch.id} node={branch} onLeafClick={onMenuItemClick} t={t} />
        ))}
      </Tree>
    </div>
  );
};

interface OverlayMenuProps {
  menuData: MenuItem;
  isOpen: boolean;
  closeMenu: () => void;
  openMenu: () => void;
  pathResolver: (id: string) => string | undefined;
}

export const OverlayMenu: React.FC<OverlayMenuProps> = ({
  menuData,
  closeMenu,
  openMenu,
  isOpen,
  pathResolver
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { showSpinner, stopSpinner } = useMessage();

  const handleMenuClick = async (id: string) => {
    const path = pathResolver(id);
    if (path) {
      showSpinner();
      setTimeout(() => {
        navigate(path);
        closeMenu();
        stopSpinner();
      }, 500);
    }
  };
  const restoreFocusTargetAttributes = useRestoreFocusTarget();
  const restoreFocusSourceAttributes = useRestoreFocusSource();

  return (
    <div>
      <Drawer
        {...restoreFocusSourceAttributes}
        onOpenChange={() => (isOpen ? closeMenu() : openMenu())}
        open={false}
        // open={isOpen}
        separator
        type="overlay"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={closeMenu}
              />
            }
          >
            Main Menu
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody className={styles.body}>
          <Menu data={menuData} onMenuItemClick={handleMenuClick} />
        </DrawerBody>
      </Drawer>
      <Button
        {...restoreFocusTargetAttributes}
        appearance="subtle"
        aria-label="Menu"
        icon={<RowTripleFilled />}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
      />
    </div>
  );
};
