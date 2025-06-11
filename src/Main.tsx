import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { SystemToolbar } from './components/system-toolbar';

import languageEn from './i18n/en/language.json';
import languageZhHant from './i18n/zhHant/language.json';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { authenticationAtom } from './states/authentication';
import { useAtomValue } from 'jotai';
import { useTheme } from './contexts/Theme';
import { LanguageEnum } from './models/openapi';
import { PageTransitionProvider } from './contexts/PageTransition';
import HomePage from './pages/home-page';
import { UserMaintenancePage } from './pages/user-maintenance/user-maintenance-page';
import { Breadcrumb } from './components/breadcrumb';
import { ButtombarMenu, SidebarMenu } from './components/navigation-menu';
import { ArrowLeftFilled, RowTripleFilled } from '@fluentui/react-icons';
import { MarketPlaceShowcase } from './pages/market/market-place';
import { StudentShopPage } from './pages/market/student-shop';
import { ProductApprovalPage } from './pages/product-approval/product-approval-page';
import { useDialog } from './hooks/use-dialog';
import { useFormDirty } from './contexts/FormDirty';
import { DeviceComponent } from './components/device-component';
import { MobileSettingsPage } from './pages/mobile/setting';
import { useScrollDirection } from './hooks/use-scroll-direction';
import { useIsMobile } from './hooks/use-mobile';
import { MobileUserProfilePage } from './pages/mobile/profile';
import { MobileParentUserPage } from './pages/mobile/parent';
import { MarketPlaceProductDetail } from './pages/market/market-place-product-detail';
import { StudentShoproductDetail } from './pages/market/student-shop-product-detail';
import { ActivityMaintenancePage } from './pages/activity/activity-maintenance-page';
import { AchievementEditPage } from './pages/achievement/achievement-edit-page';
import { AchievementApprovalPage } from './pages/achievement-approval/achievement-approval-page';

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { global: languageEn }, zhHant: { global: languageZhHant } },
});

const bottomBarHeight = '56px';

const useStyles = makeStyles({
  // position: 'relative' to keep toolbar and sidebar sticky and suppress double vertical scrollbar
  app: { position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: {
    // position: 'sticky',
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
    height: '100%',
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

export const Main: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection(contentRef);
  const [showBottomBar, setShowBottomBar] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styles = useStyles();
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const login = useAtomValue(authenticationAtom).login;
  const { isDirty, resetDirty } = useFormDirty();
  const { showDiscardChangeDialog } = useDialog();
  const isMobile = useIsMobile();

  
  const selectedLanguage = i18n.language === 'en' ? LanguageEnum.English : LanguageEnum.TraditionalChinese;

  const menuData = login?.menu;

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
    // only apply on mobile
    if (isMobile) {
      if (scrollDirection === 'down') {
        setShowBottomBar(false);
      }
      if (scrollDirection === 'up') {
        setShowBottomBar(true);
      }
    }
  }, [isMobile, scrollDirection]);

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerMenu}>
            {menuData && (
              <DeviceComponent
                desktop={
                  <Button
                    appearance="subtle"
                    aria-label="Close"
                    icon={isMenuOpen ? <ArrowLeftFilled /> : <RowTripleFilled />}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  />
                }
                mobile={<></>}
              ></DeviceComponent>
            )}
            {menuData && <Breadcrumb confirmationPrompt={confirmationPrompt} menuData={menuData} />}
          </div>
          <div className={styles.headerItem}>
            <SystemToolbar
              language={
                selectedLanguage === LanguageEnum.English
                  ? LanguageEnum.English
                  : LanguageEnum.TraditionalChinese
              }
              onSetLanguage={(value) => {
                // i18n.changeLanguage(value === 'zhHant' ? 'zhHant' : 'en');
                i18n.changeLanguage(value === LanguageEnum.TraditionalChinese ? 'zhHant' : 'en');
              }}
              onSetTheme={(theme) => {
                setTheme(theme);
              }}
              theme={['light', 'dark', 'playful'].includes(theme) ? theme : 'light'}
            />
          </div>
        </header>

        <div className={styles.body}>
          <DeviceComponent
            desktop={<SidebarMenu collapsed={!isMenuOpen} />}
            mobile={<></>}
          ></DeviceComponent>

          <main ref={contentRef} className={styles.content}>
            <PageTransitionProvider>
              <Routes>
                <Route element={<HomePage />} path="/" />
                <Route element={<MarketPlaceShowcase />} path="/market" />
                <Route element={<StudentShopPage />} path="/shop/:id" />
                <Route element={<MarketPlaceProductDetail />} path="/market/:id/view" />
                <Route element={<StudentShoproductDetail />} path="/shop/:id/view" />
                <Route element={<StudentShoproductDetail />} path="/shop/:id/edit" />
                <Route element={<ProductApprovalPage />} path="/approval" />
                <Route element={<ProductApprovalPage />} path="/approval/:id/view" />
                <Route element={<UserMaintenancePage />} path="/user" />
                <Route element={<UserMaintenancePage />} path="/user/:id/view" />
                <Route element={<UserMaintenancePage />} path="/user/:id/edit" />
                <Route element={<UserMaintenancePage />} path="/user/add" />
                <Route element={<UserMaintenancePage />} path="/user/add-parent" />
                <Route element={<ActivityMaintenancePage />} path="/activity" />
                <Route element={<ActivityMaintenancePage />} path="/activity/add" />
                <Route element={<ActivityMaintenancePage />} path="/activity/:id/view" />
                <Route element={<ActivityMaintenancePage />} path="/activity/:id/edit" />
                <Route
                  element={
                    <MobileSettingsPage
                      language={
                        selectedLanguage === LanguageEnum.English
                          ? LanguageEnum.English
                          : LanguageEnum.TraditionalChinese
                      }
                      onSetLanguage={(value) => {
                        i18n.changeLanguage(
                          value === LanguageEnum.TraditionalChinese ? 'zhHant' : 'en',
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
                <Route element={<AchievementEditPage />} path="/achievement" />
                <Route element={<AchievementApprovalPage />} path="/achievement-approval" />
                <Route element={<AchievementApprovalPage />} path="/achievement-approval/:id/view" />
                <Route element={<MobileUserProfilePage />} path="/profile" />
                <Route element={<MobileParentUserPage />} path="/parent" />
              </Routes>
            </PageTransitionProvider>
            <div className={styles.spacer} /> {/* Reserve space for bottom bar */}
          </main>
        </div>

        <DeviceComponent
          desktop={<></>}
          mobile={
            <div className={showBottomBar ? styles.bottomBarVisible : styles.bottomBarHidden}>
              <ButtombarMenu />
            </div>
          }
        ></DeviceComponent>
      </div>
    </BrowserRouter>
  );
};
