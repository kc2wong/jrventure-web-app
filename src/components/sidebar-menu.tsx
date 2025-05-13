import React from 'react';
import { Caption1, makeStyles, shorthands, tokens, Tooltip } from '@fluentui/react-components';
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
import { RoleBaseComponent } from './role-based-component';
import { UserRoleEnum } from '../models/openapi';

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
    // fontStyle: 'italic',
    marginLeft: tokens.spacingHorizontalM,
    marginRight: tokens.spacingHorizontalM,
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
  const authenticationAtomValue = useAtomValue(authenticationAtom);
  const studentId = authenticationAtomValue.login?.user.entitledStudent[0]?.id;

  return (
    <div className={styles.sidebar} style={{ width: collapsed ? 40 : 200 }}>
      <MenuItem collapsed={collapsed} icon={WalletRegular} label="Wallet" path="/" />
      <SidebarDivider collapsed={collapsed} title="Entrepreneur" />
      <MenuItem
        collapsed={collapsed}
        icon={StoreMicrosoftRegular}
        label="Market Place"
        path={'/market'}
      />
      <RoleBaseComponent entitledRole={[UserRoleEnum.Student, UserRoleEnum.Parent]}>
        <MenuItem
          collapsed={collapsed}
          icon={ShoppingBagRegular}
          label="My Shop"
          path={`/shop/${studentId}`}
        />
      </RoleBaseComponent>
      <SidebarDivider collapsed={collapsed} title="Achievement" />
      <MenuItem collapsed={collapsed} icon={AccessibilityRegular} label="Activity" path="/" />
      <MenuItem collapsed={collapsed} icon={PenSparkleRegular} label="Evaluation" path="/" />
      <RoleBaseComponent entitledRole={UserRoleEnum.Teacher}>
        <SidebarDivider collapsed={collapsed} title="Approval" />
        <MenuItem
          collapsed={collapsed}
          icon={BoxCheckmarkRegular}
          label="Product Approval"
          path="/approval"
        />
        <MenuItem
          collapsed={collapsed}
          icon={PeopleCheckmarkRegular}
          label="Banner Approval"
          path="/approval"
        />
      </RoleBaseComponent>
      <RoleBaseComponent entitledRole={UserRoleEnum.Admin}>
        <MenuItem collapsed={collapsed} icon={PeopleRegular} label="User" path="/user" />
      </RoleBaseComponent>
    </div>
  );
};
