import type { MultiLanguageName } from '@openapi/index.schemas';
import { useTranslation } from 'react-i18next';

const isoToLangKey = (isoCode: string): keyof MultiLanguageName =>
  (isoCode === 'zh-Hant'
    ? 'zhHant'
    : isoCode === 'zh-Hans'
      ? 'zhHans'
      : isoCode) as keyof MultiLanguageName;

const usePreferredLanguage = () => {
  const { i18n } = useTranslation();

  const nameInPreferredLanguage = (
    name: MultiLanguageName,
  ): string => {
    const langKey = isoToLangKey(i18n.language);
    const nameInPreferredLanguage = name[langKey];
    return nameInPreferredLanguage
      ? nameInPreferredLanguage
      : (Object.values(name).find((v) => v !== undefined) ?? '');
  };

  const fullNameInPreferredLanguage = (
    firstName: MultiLanguageName,
    lastName: MultiLanguageName,
  ): string => {
    const langKey = isoToLangKey(i18n.language);
    return langKey === 'en'
      ? `${firstName[langKey]} ${lastName[langKey]}`
      : `${lastName[langKey]}${firstName[langKey]}`;
  };

  return { fullNameInPreferredLanguage, nameInPreferredLanguage };
};

export { usePreferredLanguage };
