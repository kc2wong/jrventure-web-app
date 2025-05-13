import { useTranslation } from 'react-i18next';
import { LanguageEnum, Student, User, Shop, SimpleUser } from '../models/openapi';

export const useNameInPreferredLanguage = (
  object: Student | SimpleUser | User | Shop | undefined,
): string => {
  const { i18n } = useTranslation();

  const languagePreference =
    i18n.language === 'en'
      ? [LanguageEnum.English, LanguageEnum.TraditionalChinese]
      : [LanguageEnum.TraditionalChinese, LanguageEnum.English];

  if (object === undefined) {
    return '';
  }
  const constuctStudentName = (student: Student) => {
    return {
      [LanguageEnum.English]: `${student.firstName[LanguageEnum.English]} ${student.lastName[LanguageEnum.English]}`,
      [LanguageEnum.TraditionalChinese]: `${student.lastName[LanguageEnum.TraditionalChinese]}${student.firstName[LanguageEnum.TraditionalChinese]}`,
      [LanguageEnum.SimplifiedChinese]: `${student.lastName[LanguageEnum.SimplifiedChinese]}${student.firstName[LanguageEnum.SimplifiedChinese]}`,
    };
  };

  const name =
    'name' in object
      ? object.name
      : 'description' in object
        ? object.description
        : constuctStudentName(object);

  if (typeof name === 'string') {
    return name;
  }

  return (
    languagePreference
      .map((lang) => (name as Record<LanguageEnum, string>)[lang])
      .find((text) => text !== undefined) ?? ''
  );
};
