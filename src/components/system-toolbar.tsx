import {
  makeStyles,
  Menu,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MenuItemRadio,
  Button,
  Divider,
  Label,
  Avatar,
  Popover,
  PopoverSurface,
  PopoverTrigger,
} from '@fluentui/react-components';
import {
  BalloonRegular,
  CheckmarkRegular,
  DismissRegular,
  DoorArrowLeftRegular,
  GlobeRegular,
  MailUnreadRegular,
  PeopleAddRegular,
  StoreMicrosoftRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, UserRole } from '../models/openapi';
import { Theme } from '../contexts/Theme';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useFormDirty } from '../contexts/FormDirty';
import { Login } from '../models/login';
import { authenticationAtom } from '../states/authentication';
import { useDialog } from '../hooks/use-dialog';
import { useMessage } from '../hooks/use-message';
import { MultiLingualLabel } from './multi-lang-label';
import { useNavigateWithSpinner } from '../hooks/use-delay-navigate';

const useStyles = makeStyles({
  item: { display: 'flex', justifyContent: 'flex-start', gap: '10px' },
  button: { justifyContent: 'flex-start', width: '110px' },
  siteButtonText: {
    display: 'block',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    width: '80px',
  },
  dialogButtonPanel: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '4px',
    gap: '8px',
  },
  divider: { width: '8px' },
  profileContentHeader: { marginTop: '0' },
});

const Spacer: React.FC = () => {
  const styles = useStyles();
  return <Divider className={styles.divider} vertical />;
};

const StudentRoleInfo: React.FC<{ login?: Login }> = ({ login }) => {
  if (!login) {
    return <></>;
  }

  const user = login.user;
  const { role, entitledStudent } = user;

  if (role !== UserRole.STUDENT || !entitledStudent || entitledStudent.length === 0) {
    return <></>;
  }

  const student = entitledStudent[0];
  const name = {
    [Language.ENGLISH]: `${student.firstName[Language.ENGLISH]} ${student.lastName[Language.ENGLISH]}`,
    [Language.TRADITIONAL_CHINESE]: `${student.lastName[Language.TRADITIONAL_CHINESE]}${student.firstName[Language.TRADITIONAL_CHINESE]}`,
    [Language.SIMPLIFIED_CHINESE]: `${student.lastName[Language.SIMPLIFIED_CHINESE]}${student.firstName[Language.SIMPLIFIED_CHINESE]}`,
  };

  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'end',
            margin: '4px',
            gap: '8px',
            width: '150px',
          }}
        >
          <Avatar color="brand" size={24} />
          <Label>{`${student.classId}-${student.studentNumber}`}</Label>
          <MultiLingualLabel caption={name}>
            <Label />
          </MultiLingualLabel>
        </div>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1}>
        <div>
          <p>No parent account</p>
          <Button icon={<PeopleAddRegular />}>Create parent account</Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

const MessageButton: React.FC = () => {
  return <Button icon={<MailUnreadRegular />}></Button>;
};

const MartketPlaceButton: React.FC = () => {
  const navigate = useNavigateWithSpinner();
  return (
    <Button
      appearance="transparent"
      icon={<StoreMicrosoftRegular />}
      onClick={() => navigate('/market')}
    ></Button>
  );
};

const SignoutButton: React.FC = () => {
  const action = useSetAtom(authenticationAtom);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showConfirmationDialog } = useDialog();
  const { isDirty } = useFormDirty();
  const { showSpinner, stopSpinner } = useMessage();

  const signOut = () => {
    showSpinner();
    setTimeout(() => {
      stopSpinner();
      action({ signOut: {} });
      navigate('/');
    }, 500);
  };

  return (
    <Button
      icon={<DoorArrowLeftRegular />}
      onClick={() => {
        if (isDirty()) {
          showConfirmationDialog({
            confirmType: t('system.message.signOut'),
            message: t('userProfile.discardChangeAndSignOut'),
            primaryButton: {
              label: t('userProfile.signOut'),
              icon: <CheckmarkRegular />,
              action: signOut,
            },
            secondaryButton: { label: t('system.message.cancel'), icon: <DismissRegular /> },
          });
        } else {
          showConfirmationDialog({
            confirmType: t('system.message.signOut'),
            message: t('userProfile.doYouWantToSignOut'),
            primaryButton: {
              label: t('userProfile.signOut'),
              icon: <CheckmarkRegular />,
              action: signOut,
            },
            secondaryButton: { label: t('system.message.cancel'), icon: <DismissRegular /> },
          });
        }
      }}
    ></Button>
  );
};

interface SystemToolbarProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  language: Language;
  onSetLanguage: (language: Language) => void;
}

export const SystemToolbar: React.FC<SystemToolbarProps> = ({
  language,
  onSetLanguage,
  theme,
  onSetTheme,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const handleChangeTheme = (value: Theme) => {
    onSetTheme(value);
  };

  const handleChangeLanguage = (value: Language) => {
    onSetLanguage(value);
  };

  const handleCloseSiteMenu = () => {
    if (isSiteMenuOpen) {
      setIsSiteMenuOpen(false);
    }
  };

  const languageEn = t('system.language.value.en');
  const languageZhHant = t('system.language.value.zhHant');
  const themeLight = t('system.theme.value.light');
  const themeDark = t('system.theme.value.dark');
  const themePlayful = t('system.theme.value.playful');

  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const login = useAtomValue(authenticationAtom).login;

  const themeIconConfigs: Record<Theme, JSX.Element> = {
    playful: <BalloonRegular />,
    light: <WeatherSunnyRegular />,
    dark: <WeatherMoonRegular />,
  };

  return (
    <div className={styles.item}>
      <MartketPlaceButton />
      <Spacer />
      <StudentRoleInfo login={login} />
      <Spacer />
      <Menu checkedValues={{ lang: [language === Language.ENGLISH ? 'en' : 'zhHant'] }}>
        <MenuTrigger disableButtonEnhancement>
          <Button icon={<GlobeRegular />} onClick={handleCloseSiteMenu}></Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemRadio
              name="lang"
              onClick={() => handleChangeLanguage(Language.ENGLISH)}
              value="en"
            >
              {languageEn}
            </MenuItemRadio>
            <MenuItemRadio
              name="lang"
              onClick={() => handleChangeLanguage(Language.TRADITIONAL_CHINESE)}
              value="zhHant"
            >
              {languageZhHant}
            </MenuItemRadio>
          </MenuList>
        </MenuPopover>
      </Menu>
      <Menu checkedValues={{ theme: [theme] }}>
        <MenuTrigger disableButtonEnhancement>
          <Button icon={themeIconConfigs[theme]} onClick={handleCloseSiteMenu}></Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemRadio name="theme" onClick={() => handleChangeTheme('light')} value="light">
              {themeLight}
            </MenuItemRadio>
            <MenuItemRadio name="theme" onClick={() => handleChangeTheme('dark')} value="dark">
              {themeDark}
            </MenuItemRadio>
            <MenuItemRadio
              name="theme"
              onClick={() => handleChangeTheme('playful')}
              value="playful"
            >
              {themePlayful}
            </MenuItemRadio>
          </MenuList>
        </MenuPopover>
      </Menu>
      <MessageButton />
      <SignoutButton />
    </div>
  );
};
