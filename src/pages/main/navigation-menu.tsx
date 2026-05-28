import {
  Caption1,
  Caption2,
  makeStyles,
  mergeClasses,
  Tab,
  TabList,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { isItemVisible, navigationMenu } from './navigation-menu-data';
import { authStateAtom } from '../../stores/auth/auth-bloc';

const useSidebarStyles = makeStyles({
  sidebar: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRightColor: tokens.colorNeutralStroke2,
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowX: 'hidden',
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalS,
    transition: 'width 0.2s ease',
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: tokens.borderRadiusLarge,
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    display: 'flex',
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalS,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
      color: tokens.colorNeutralForeground2Hover,
    },
  },
  icon: {
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    width: '22px',
  },
  label: {
    marginLeft: tokens.spacingHorizontalM,
    overflow: 'hidden',
    transition: 'opacity 0.2s ease, width 0.2s ease',
    whiteSpace: 'nowrap',
  },
  divider: {
    alignItems: 'center',
    display: 'flex',
    height: tokens.spacingVerticalXXS,
    marginBottom: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalM,
  },
  dividerLine: {
    backgroundColor: tokens.colorNeutralStroke1,
    flexGrow: 1,
    height: '1px',
  },
  dividerTitle: {
    color: tokens.colorNeutralForeground2,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
});

const useBottombarStyles = makeStyles({
  container: {
    height: '56px',
    position: 'relative',
  },
  scrollContainer: {
    height: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
  },
  tabList: {
    height: '56px',
    minWidth: 'max-content',
  },
  tab: {
    flexShrink: 0,
    height: '100%',
    minWidth: '72px',
    paddingBottom: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalM,
  },
  tabContent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: tokens.spacingVerticalXS,
    position: 'relative',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '2px',
  },
  scrollArrow: {
    alignItems: 'center',
    background: 'none',
    border: 'none',
    bottom: 0,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '20px',
    padding: '0',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  scrollArrowLeft: {
    background: `linear-gradient(to right, ${tokens.colorNeutralBackground1} 50%, transparent)`,
    left: 0,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalXL,
  },
  scrollArrowRight: {
    background: `linear-gradient(to left, ${tokens.colorNeutralBackground1} 50%, transparent)`,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalS,
    right: 0,
  },
});

type SidebarDividerProps = {
  title?: string;
  collapsed: boolean;
  visible: boolean;
};

const SidebarDivider = ({ title, collapsed, visible }: SidebarDividerProps) => {
  const styles = useSidebarStyles();

  return (
    <div className={styles.divider} style={visible ? {} : { visibility: 'hidden' }}>
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
  collapsed: boolean;
  icon: React.ElementType;
  id: string;
  label: string;
  path: string;
};

const MenuItem = ({ collapsed, icon: Icon, label, path }: MenuItemProps) => {
  const styles = useSidebarStyles();
  const navigate = useNavigate();

  const content = (
    <div className={styles.menuItem} onClick={() => navigate(path)}>
      <div className={styles.icon}>
        <Icon fontSize={24} />
      </div>
      <span
        className={styles.label}
        style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
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
  const styles = useSidebarStyles();
  const { t } = useTranslation();
  const { entitledMenuItemIds } = useAtomValue(authStateAtom);

  const visibleSections = navigationMenu
    .map((section) => ({
      ...section,
      visibleItems: section.items.filter((item) => isItemVisible(item, entitledMenuItemIds)),
    }))
    .filter((section) => section.visibleItems.length > 0);

  return (
    <div className={styles.sidebar} style={{ width: collapsed ? 40 : 200 }}>
      {visibleSections.map((section, sectionIdx) => (
        <React.Fragment key={section.titleKey ?? sectionIdx}>
          <SidebarDivider
            collapsed={collapsed}
            title={section.titleKey ? t(section.titleKey) : undefined}
            visible={!collapsed || sectionIdx !== 0}
          />
          {section.visibleItems.map((item) => (
            <MenuItem
              key={item.id}
              collapsed={collapsed}
              icon={item.icon}
              id={item.id}
              label={t(item.labelKey)}
              path={item.path}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

type ButtombarMenuItemProps = {
  icon: React.ElementType<SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
};

const ButtombarMenuItem = ({ icon: Icon, label }: ButtombarMenuItemProps) => {
  const styles = useBottombarStyles();

  return (
    <Tab className={styles.tab} onClick={() => {}} value={label}>
      <div className={styles.tabContent}>
        <Icon className={styles.icon} />
        <Caption2>{label}</Caption2>
      </div>
    </Tab>
  );
};

export const BottombarMenu = () => {
  const styles = useBottombarStyles();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { entitledMenuItemIds } = useAtomValue(authStateAtom);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, []);

  const scrollBy = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -150 : 150,
      behavior: 'smooth',
    });
  };

  const bottomBarItems = navigationMenu
    .flatMap((section) => section.items)
    .filter((item) => isItemVisible(item, entitledMenuItemIds));

  return (
    <div className={styles.container}>
      {canScrollLeft && (
        <button
          className={mergeClasses(styles.scrollArrow, styles.scrollArrowLeft)}
          onClick={() => scrollBy('left')}
        >
          <ChevronLeftRegular />
        </button>
      )}
      <div ref={scrollRef} className={styles.scrollContainer}>
        <TabList
          appearance="transparent"
          className={styles.tabList}
          defaultSelectedValue="home"
          size="large"
        >
          {bottomBarItems.map((item) => (
            <ButtombarMenuItem
              key={item.id}
              icon={item.icon}
              label={t(item.labelKey)}
              path={item.path}
            />
          ))}
        </TabList>
      </div>
      {canScrollRight && (
        <button
          className={mergeClasses(styles.scrollArrow, styles.scrollArrowRight)}
          onClick={() => scrollBy('right')}
        >
          <ChevronRightRegular />
        </button>
      )}
    </div>
  );
};
