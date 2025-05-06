import { useTranslation } from 'react-i18next';
import { Language } from '../models/openapi';

export const usePreferredLanguageLabel = (label: Record<string, string>): string => {
  const { i18n } = useTranslation();

  const languagePreference =
    i18n.language === 'en'
      ? [Language.ENGLISH, Language.TRADITIONAL_CHINESE]
      : [Language.TRADITIONAL_CHINESE, Language.ENGLISH];

  return languagePreference.map((lang) => label[lang]).find((text) => text !== undefined) ?? '';
};
