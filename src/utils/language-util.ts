import { LanguageEnum } from '../models/openapi';

/**
 * Resolves a multilingual field (e.g. name, description) based on language preference
 * @param language - current language string ('en' | 'zh-Hant' etc.)
 * @param field - the multilingual field name in the object (e.g. 'name')
 * @param object - the object containing that field (may be undefined)
 * @returns best matched string or empty string
 */
export const getFieldValueInPreferredLanguage = <T extends Record<string, any>>(
  language: string,
  field: keyof T,
  object: T | undefined,
): string => {
  if (!object || typeof object !== 'object') {
    return '';
  }

  const languagePreference =
    language === 'en'
      ? [LanguageEnum.English, LanguageEnum.TraditionalChinese]
      : [LanguageEnum.TraditionalChinese, LanguageEnum.English];

  const fieldValue = object[field];

  if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
    for (const lang of languagePreference) {
      const value = fieldValue[lang];
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return '';
};
