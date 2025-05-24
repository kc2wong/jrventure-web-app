import React, { cloneElement, SVGProps } from 'react';
import {
  Caption1,
  Caption2,
  makeStyles,
  shorthands,
  Tab,
  TabList,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import {
  AccessibilityRegular,
  ShoppingBagRegular,
  PenSparkleRegular,
  PeopleRegular,
  WalletRegular,
  BoxCheckmarkRegular,
  StoreMicrosoftRegular,
  PeopleCheckmarkRegular,
} from '@fluentui/react-icons';
import { useNavigationHelpers } from '../hooks/use-delay-navigate';
import { useAtomValue } from 'jotai';
import { authenticationAtom } from '../states/authentication';
import { UserRoleEnum } from '../models/openapi';
import { RoleBaseComponent } from './role-based-component';

type NavigationMenuItem =
  | {
      type: 'item';
      id: string;
      label: string;
      icon: React.ElementType<React.SVGProps<SVGSVGElement>>;
      path: string;
      roles?: UserRoleEnum[];
      showInSidebar?: boolean;
      showInBottomBar?: boolean;
    }
  | {
      type: 'divider';
      title?: string;
      roles?: UserRoleEnum[];
      showInSidebar?: boolean;
    };

const navigationMenu: NavigationMenuItem[] = [
  {
    type: 'item',
    id: 'mnuWallet',
    label: 'Wallet',
    icon: WalletRegular,
    path: '/',
    showInSidebar: true,
    showInBottomBar: true,
  },

  { type: 'divider', title: 'Entrepreneur', showInSidebar: true },

  {
    type: 'item',
    id: 'mnuMarkeet',
    label: 'Market Place',
    icon: StoreMicrosoftRegular,
    path: '/market',
    showInSidebar: true,
    showInBottomBar: true,
  },
  {
    type: 'item',
    id: 'mnuShop',
    label: 'My Shop',
    icon: ShoppingBagRegular,
    path: '/shop/:studentId',
    roles: [UserRoleEnum.Student, UserRoleEnum.Parent],
    showInSidebar: true,
    showInBottomBar: true,
  },

  { type: 'divider', title: 'Achievement', showInSidebar: true },

  {
    type: 'item',
    id: 'mnuActivity',
    label: 'Activity',
    icon: AccessibilityRegular,
    path: '/activity',
    showInSidebar: true,
  },
  {
    type: 'item',
    id: 'mnuEvaluation',
    label: 'Evaluation',
    icon: PenSparkleRegular,
    path: '/',
    showInSidebar: true,
  },

  { type: 'divider', title: 'Approval', showInSidebar: true, roles: [UserRoleEnum.Teacher] },

  {
    type: 'item',
    id: 'mnuProductApproval',
    label: 'Product Approval',
    icon: BoxCheckmarkRegular,
    path: '/approval',
    roles: [UserRoleEnum.Teacher],
    showInSidebar: true,
  },
  {
    type: 'item',
    id: 'mnuBannerApproval',
    label: 'Banner Approval',
    icon: PeopleCheckmarkRegular,
    path: '/approval',
    roles: [UserRoleEnum.Teacher],
    showInSidebar: true,
  },

  {
    type: 'item',
    id: 'mnuBannerUser',
    label: 'User',
    icon: PeopleRegular,
    path: '/user',
    roles: [UserRoleEnum.Admin],
    showInSidebar: true,
  },
];

const useStyles = makeStyles({
  sidebar: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #ddd',
    transition: 'width 0.2s ease',
    overflowX: 'hidden',
    ...shorthands.padding('8px'),
    zIndex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.padding('8px', '8px'),
    cursor: 'pointer',
    borderRadius: '6px',
    color: tokens.colorNeutralForeground2,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
      color: tokens.colorNeutralForeground2Hover,
    },
    textDecoration: 'none',
    transition: 'background 0.2s ease',
  },
  iconWrapper: {
    width: '22px',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    marginLeft: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'opacity 0.2s ease, width 0.2s ease',
  },

  dividerRoot: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.margin(tokens.spacingVerticalM, 0),
    width: '100%',
    height: '1px',
  },
  dividerLine: {
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke1,
    flexGrow: 1,
  },
  dividerTitle: {
    color: tokens.colorNeutralForeground2,
    marginLeft: tokens.spacingHorizontalM,
    marginRight: tokens.spacingHorizontalM,
  },
  tabList: {
    justifyContent: 'space-between',
    marginLeft: tokens.spacingHorizontalXXL,
    marginRight: tokens.spacingHorizontalXXL,
    height: '56px', // Adjust height here
  },
  tab: {
    paddingTop: tokens.spacingVerticalM, // Reduce top padding
    paddingBottom: tokens.spacingVerticalS, // Bring icon closer to indicator
    height: '100%',
    minWidth: '48px', // Optional: control tab width
  },
  tabContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '4px',
    position: 'relative',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '2px',
  },
});

type SidebarDividerProps = {
  title?: string;
  collapsed: boolean;
};

const SidebarDivider = ({ title, collapsed }: SidebarDividerProps) => {
  const styles = useStyles();

  return (
    <div className={styles.dividerRoot}>
      <div className={styles.dividerLine} />
      {!collapsed && title && (
        <Caption1 className={styles.dividerTitle} italic>
          {title}
        </Caption1>
      )}
      <div className={styles.dividerLine} />
    </div>
  );
};

type MenuItemProps = {
  icon: React.ElementType;
  label: string;
  path: string;
  collapsed: boolean;
};

const MenuItem = ({ icon: Icon, label, collapsed, path }: MenuItemProps) => {
  const styles = useStyles();
  const { navigateWithSpinner } = useNavigationHelpers();

  const content = (
    <div
      className={styles.menuItem}
      onClick={() => {
        navigateWithSpinner(path);
      }}
    >
      <div className={styles.iconWrapper}>
        <Icon fontSize={24} />
      </div>
      <span
        className={styles.label}
        style={{
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 'auto',
        }}
      >
        {label}
      </span>
    </div>
  );

  return collapsed ? (
    <Tooltip content={label} positioning="after" relationship="label">
      {content}
    </Tooltip>
  ) : (
    content
  );
};

type SidebarMenuProps = {
  collapsed: boolean;
};

export const SidebarMenu = ({ collapsed }: SidebarMenuProps) => {
  const styles = useStyles();
  const auth = useAtomValue(authenticationAtom);
  const studentId = auth.login?.user.entitledStudent[0]?.id;

  return (
    <div className={styles.sidebar} style={{ width: collapsed ? 40 : 200 }}>
      {navigationMenu
        .filter((item) => item.showInSidebar)
        .map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <SidebarDivider key={`divider-${idx}`} collapsed={collapsed} title={item.title} />
            );
          }

          const resolvedPath = item.path.includes(':studentId')
            ? item.path.replace(':studentId', studentId ?? '')
            : item.path;

          const menuItem = (
            <MenuItem
              collapsed={collapsed}
              icon={item.icon}
              label={item.label}
              path={resolvedPath}
            />
          );

          return item.roles ? (
            <RoleBaseComponent key={item.id} entitledRole={item.roles}>
              {menuItem}
            </RoleBaseComponent>
          ) : (
            // menuItem
            cloneElement(menuItem, { key: item.id })
          );
        })}
    </div>
  );
};

type ButtombarMenuItemProps = {
  icon: React.ElementType<SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
};

const ButtombarMenuItem = ({ icon: Icon, label, path }: ButtombarMenuItemProps) => {
  const styles = useStyles();
  const { navigateWithSpinner } = useNavigationHelpers();

  return (
    <Tab className={styles.tab} onClick={() => navigateWithSpinner(path)} value={label}>
      <div className={styles.tabContentWrapper}>
        <Icon className={styles.icon} />
        <Caption2>{label}</Caption2>
      </div>
    </Tab>
  );
};

const isMenuItem = (
  item: NavigationMenuItem,
): item is Extract<NavigationMenuItem, { type: 'item' }> => {
  return item.type === 'item';
};

export const ButtombarMenu = () => {
  const styles = useStyles();

  return (
    <TabList
      appearance="transparent"
      className={styles.tabList}
      defaultSelectedValue="home"
      size="large"
    >
      {navigationMenu
        .filter(isMenuItem)
        .filter((item) => item.showInBottomBar)
        .map((item) => {
          const menuItem = (
            <ButtombarMenuItem
              key={`${item.id}_1`}
              icon={item.icon}
              label={item.label}
              path={item.path}
            />
          );
          return item.roles ? (
            <RoleBaseComponent key={item.id} entitledRole={item.roles}>
              {menuItem}
            </RoleBaseComponent>
          ) : (
            cloneElement(menuItem, { key: item.id })
          );
        })}
    </TabList>
  );
};
