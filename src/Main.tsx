import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
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
import { SidebarMenu } from './components/sidebar-menu';
import { ArrowLeftFilled, HeartRegular, RowTripleFilled } from '@fluentui/react-icons';
import { MarketPlaceShowcase } from './pages/market/market-place';
import { ProductDetail } from './pages/product/product-detail';
import { StudentShopPage } from './pages/market/student-shop-page';
import { ProductApprovalPage } from './pages/product-approval/product-approval-page';
import { useDialog } from './hooks/use-dialog';
import { useFormDirty } from './contexts/FormDirty';

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { global: languageEn }, zhHant: { global: languageZhHant } },
});

const useStyles = makeStyles({
  app: { height: '100vh', display: 'flex', flexDirection: 'column' },
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
  headerMenu: { display: 'flex', flexDirection: 'row', gap: '20px', marginLeft: '6px' },
  content: {
    flex: 1,
    overflowY: 'auto',
  },
});

export const Main: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styles = useStyles();
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const login = useAtomValue(authenticationAtom).login;
  const { isDirty, resetDirty } = useFormDirty();
  const { showDiscardChangeDialog } = useDialog();

  const isLightTheme = theme === 'light';
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

  return (
    <Router>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerMenu}>
            {menuData && (
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={isMenuOpen ? <ArrowLeftFilled /> : <RowTripleFilled />}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            )}
            {menuData && (
              // <Breadcrumb menuData={menuData} pageElements={_enrichedPageElementNavigation} />
              <Breadcrumb confirmationPrompt={confirmationPrompt} menuData={menuData} />
            )}
          </div>
          <div className={styles.headerItem}>
            <SystemToolbar
              language={
                selectedLanguage === Language.ENGLISH
                  ? Language.ENGLISH
                  : Language.TRADITIONAL_CHINESE
              }
              onSetLanguage={(value) => {
                // i18n.changeLanguage(value === 'zhHant' ? 'zhHant' : 'en');
                i18n.changeLanguage(value === Language.TRADITIONAL_CHINESE ? 'zhHant' : 'en');
              }}
              onSetTheme={(theme) => {
                setTheme(theme);
              }}
              theme={isLightTheme ? 'light' : 'dark'}
            />
          </div>
        </header>

        <div className={styles.body}>
          <SidebarMenu collapsed={!isMenuOpen} />

          <main className={styles.content}>
            <PageTransitionProvider>
              <Routes>
                <Route element={<HomePage />} path="/" />
                <Route element={<MarketPlaceShowcase />} path="/market" />
                {/* <Route element={<ShopPage />} path="/shop" /> */}
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
              </Routes>
            </PageTransitionProvider>
          </main>
        </div>
      </div>
    </Router>
  );
};
