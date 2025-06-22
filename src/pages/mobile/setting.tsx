import React, { useEffect } from 'react';
import { makeStyles, tokens, Text, Subtitle2, Subtitle1 } from '@fluentui/react-components';
import {
  BalloonRegular,
  Checkmark24Regular,
  DarkThemeRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import { Theme } from '../../contexts/theme';
import { LanguageEnum } from '../../models/openapi';
import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { MobileRoot } from '../../components/Container';

type SettingOption<T> = {
  label: string;
  value: T;
  icon?: JSX.Element;
};

type SettingsSection<T> = {
  title: string;
  key: string;
  options: SettingOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
};

const useStyles = makeStyles({
  content: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    textAlign: 'center',
    paddingTop: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground1,
  },
  sectionTitle: {
    color: tokens.colorNeutralForeground4,
    margin: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`,
  },
  sectionGroup: {
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    ':last-child': {
      borderBottom: 'none',
    },
    ':hover': {
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },
  },
});

export const MobileSettingsPage: React.FC<{
  theme: Theme;
  onSetTheme: (t: Theme) => void;
  language: LanguageEnum;
  onSetLanguage: (l: LanguageEnum) => void;
}> = ({ theme, onSetTheme, language, onSetLanguage }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { setNavgiateToParentOnly } = useBreadcrumb();

  useEffect(() => {
    setNavgiateToParentOnly(true);
  }, []);

  const themeIcons: Record<Theme, JSX.Element> = {
    light: <WeatherSunnyRegular fontSize={24} />,
    dark: <DarkThemeRegular fontSize={24} />,
    playful: <BalloonRegular fontSize={24} />,
  };

  const availableTheme: Theme[] = ['light', 'dark', 'playful'];
  const themeSection: SettingsSection<Theme> = {
    title: t('system.theme.label'),
    key: 'theme',
    selectedValue: theme,
    onSelect: (v) => {
      onSetTheme(v);
    },
    options: availableTheme.map((th) => {
      return { label: t(`system.theme.value.${th}`), value: th, icon: themeIcons[th] };
    }),
  };

  const availableLanguage: LanguageEnum[] = [LanguageEnum.English, LanguageEnum.TraditionalChinese];
  const languageSection: SettingsSection<LanguageEnum> = {
    title: t('system.language.label'),
    key: 'language',
    selectedValue: language,
    onSelect: (v) => {
      onSetLanguage(v);
    },
    options: availableLanguage.map((lang) => {
      return { label: t(`system.language.value.${lang}`), value: lang };
    }),
  };

  const sections: SettingsSection<any>[] = [themeSection, languageSection];

  return (
    <MobileRoot>
      <div className={styles.content}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Subtitle1 className={styles.headerTitle}>Setting</Subtitle1>
        </div>
        {sections.map((section) => (
          <div
            key={section.key}
            style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}
          >
            <Subtitle2 className={styles.sectionTitle}>{section.title}</Subtitle2>
            <div className={styles.sectionGroup}>
              {section.options.map((option) => (
                <div
                  key={option.value}
                  className={styles.row}
                  onClick={() => section.onSelect(option.value)}
                >
                  {option.icon ? (
                    <div
                      style={{
                        gap: tokens.spacingHorizontalXS,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      {option.icon}
                      <Text>{option.label}</Text>
                    </div>
                  ) : (
                    <div>
                      <Text>{option.label}</Text>
                    </div>
                  )}
                  {section.selectedValue === option.value && <Checkmark24Regular />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileRoot>
  );
};
