import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Body2, Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { SystemToolbar } from './components/system-toolbar';

import languageEn from './i18n/en/language.json';
import languageZhHant from './i18n/zhHant/language.json';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { authenticationAtom } from './states/authentication';
import { useAtomValue } from 'jotai';
import { useTheme } from './contexts/Theme';
import { Language } from './models/openapi';
import { PageTransitionProvider } from './contexts/PageTransition';
import HomePage from './pages/home-page';
import { UserMaintenancePage } from './pages/user-maintenance/user-maintenance-page';
import { Breadcrumb } from './components/breadcrumb';
import { ButtombarMenu, SidebarMenu } from './components/navigation-menu';
import {
  ArrowLeftFilled,
  ChevronLeftRegular,
  HeartRegular,
  RowTripleFilled,
} from '@fluentui/react-icons';
import { MarketPlaceShowcase } from './pages/market/market-place';
import { ProductDetail } from './pages/product/product-detail';
import { StudentShopPage } from './pages/market/student-shop-page';
import { ProductApprovalPage } from './pages/product-approval/product-approval-page';
import { useDialog } from './hooks/use-dialog';
import { useFormDirty } from './contexts/FormDirty';
import { DeviceComponent } from './components/device-component';
import { MobileSettingsPage } from './pages/setting';
import { useNavigationHelpers } from './hooks/use-delay-navigate';
import { useScrollDirection } from './hooks/use-scroll-direction';

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { global: languageEn }, zhHant: { global: languageZhHant } },
});

const bottomBarHeight = '56px';

const useStyles = makeStyles({
  app: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: tokens.spacingVerticalS,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  headerItem: { display: 'flex', justifyContent: 'flex-start', gap: '10px' },
  // hamburger icon and breadcrumb, margeLeft needs to changed with iconWrapper and width in sidebar menu
  headerMenu: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    marginLeft: tokens.spacingHorizontalS,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    height: '100vh',
    // paddingBottom: '56px', // Give space for the bottom bar  [must be same as the height in bottom bar]
  },

  spacer: {
    height: bottomBarHeight,
    flexShrink: 0,
  },

  bottomBarVisible: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: bottomBarHeight,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    zIndex: 100,
    transition: 'transform 0.3s ease-in-out',
    transform: 'translateY(0%)',
  },
  bottomBarHidden: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: bottomBarHeight,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    zIndex: 100,
    transition: 'transform 0.3s ease-in-out',
    transform: 'translateY(100%)',
  },  
});

// TODO : Move to breadcrumb
type BackButtonProps = {
  onClick: () => void;
};
export const BackButton = ({ onClick }: BackButtonProps) => {
  const { navigate } = useNavigationHelpers();
  return (
    <Button
      appearance="transparent"
      icon={<ChevronLeftRegular color={tokens.colorBrandForeground1} fontSize={20} />}
      onClick={() => {
        onClick();
        navigate(-1, { replace: true });
      }}
      style={{
        height: 32,
        color: tokens.colorBrandForeground1,
        padding: '0', // remove all internal padding
        minWidth: 'auto', // optional: stops the button from enforcing a minimum width
      }}
    >
      <Body2>Back</Body2>
    </Button>
  );
};

export const Main: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection(contentRef);
  const [showBottomBar, setShowBottomBar] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShowBackButton, setShowBackButton] = useState(false);

  const styles = useStyles();
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const login = useAtomValue(authenticationAtom).login;
  const { isDirty, resetDirty } = useFormDirty();
  const { showDiscardChangeDialog } = useDialog();

  const selectedLanguage = i18n.language === 'en' ? Language.ENGLISH : Language.TRADITIONAL_CHINESE;

  const menuData = login?.menu;

  const placeOrderButton = (
    <Button key="order" appearance="primary" icon={<HeartRegular />}>
      Place Order
    </Button>
  );

  const confirmationPrompt = (fn: () => void) => {
    if (isDirty()) {
      showDiscardChangeDialog({
        action: () => {
          fn();
          resetDirty();
        },
      });
    } else {
      fn();
      resetDirty();
    }
  };

  useEffect(() => {
    if (window.innerWidth > 600) {
      return;
    } // only apply on mobile
    if (scrollDirection === 'down') {
      setShowBottomBar(false);
    }
    if (scrollDirection === 'up') {
      setShowBottomBar(true);
    }
  }, [scrollDirection]);

  return (
    <Router>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerMenu}>
            {menuData && (
              <DeviceComponent forMobile={false}>
                <Button
                  appearance="subtle"
                  aria-label="Close"
                  icon={isMenuOpen ? <ArrowLeftFilled /> : <RowTripleFilled />}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              </DeviceComponent>
            )}
            {isShowBackButton && (
              <DeviceComponent forMobile={true}>
                <BackButton onClick={() => setShowBackButton(false)} />
              </DeviceComponent>
            )}
            {menuData && !isShowBackButton && (
              <Breadcrumb confirmationPrompt={confirmationPrompt} menuData={menuData} />
            )}
          </div>
          {!isShowBackButton && (
            <>
              <div className={styles.headerItem}>
                <SystemToolbar
                  language={
                    selectedLanguage === Language.ENGLISH
                      ? Language.ENGLISH
                      : Language.TRADITIONAL_CHINESE
                  }
                  onSetLanguage={(value) => {
                    i18n.changeLanguage(value === Language.TRADITIONAL_CHINESE ? 'zhHant' : 'en');
                  }}
                  onSetTheme={(theme) => {
                    setTheme(theme);
                  }}
                  setShowBackButton={(v) => setShowBackButton(v)}
                  theme={['light', 'dark', 'playful'].includes(theme) ? theme : 'light'}
                />
              </div>
            </>
          )}
        </header>

        <div className={styles.body}>
          <DeviceComponent forMobile={false}>
            <SidebarMenu collapsed={!isMenuOpen} />
          </DeviceComponent>

          <main ref={contentRef} className={styles.content}>
            <PageTransitionProvider>
              <Routes>
                <Route element={<HomePage />} path="/" />
                <Route element={<MarketPlaceShowcase />} path="/market" />
                <Route element={<StudentShopPage />} path="/shop/:id" />
                <Route
                  element={
                    <ProductDetail
                      buttons={[placeOrderButton]}
                      showOrder={false}
                      showReview={true}
                      showShopLink={true}
                    />
                  }
                  path="/market/:id/view"
                />
                <Route
                  element={
                    <ProductDetail
                      buttons={[]}
                      showOrder={true}
                      showReview={true}
                      showShopLink={false}
                    />
                  }
                  path="/market/:id/edit"
                />
                <Route element={<ProductApprovalPage />} path="/approval" />
                <Route element={<ProductApprovalPage />} path="/approval/:id/view" />
                <Route element={<UserMaintenancePage />} path="/user" />
                <Route element={<UserMaintenancePage />} path="/user/:id/view" />
                <Route element={<UserMaintenancePage />} path="/user/:id/edit" />
                <Route element={<UserMaintenancePage />} path="/user/add" />
                <Route element={<UserMaintenancePage />} path="/user/add-parent" />
                <Route
                  element={
                    <MobileSettingsPage
                      language={
                        selectedLanguage === Language.ENGLISH
                          ? Language.ENGLISH
                          : Language.TRADITIONAL_CHINESE
                      }
                      onSetLanguage={(value) => {
                        i18n.changeLanguage(
                          value === Language.TRADITIONAL_CHINESE ? 'zhHant' : 'en',
                        );
                      }}
                      onSetTheme={(theme) => {
                        setTheme(theme);
                      }}
                      theme={['light', 'dark', 'playful'].includes(theme) ? theme : 'light'}
                    />
                  }
                  path="/setting"
                />
              </Routes>
            </PageTransitionProvider>
            <div className={styles.spacer} /> {/* Reserve space for bottom bar */}
          </main>
        </div>

        <DeviceComponent forMobile={true}>
          <div className={showBottomBar ? styles.bottomBarVisible : styles.bottomBarHidden}>
            <ButtombarMenu />
          </div>
          {/* <ButtombarMenu /> */}
        </DeviceComponent>
      </div>
    </Router>
  );
};
