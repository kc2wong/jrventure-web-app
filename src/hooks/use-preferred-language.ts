import { useTranslation } from 'react-i18next';
import { Language, Student, User, Shop, SimpleUser } from '../models/openapi';

export const useNameInPreferredLanguage = (
  object: Student | SimpleUser | User | Shop | undefined,
): string => {
  const { i18n } = useTranslation();

  const languagePreference =
    i18n.language === 'en'
      ? [Language.ENGLISH, Language.TRADITIONAL_CHINESE]
      : [Language.TRADITIONAL_CHINESE, Language.ENGLISH];

  if (object === undefined) {
    return '';
  }
  const constuctStudentName = (student: Student) => {
    return {
      [Language.ENGLISH]: `${student.firstName[Language.ENGLISH]} ${student.lastName[Language.ENGLISH]}`,
      [Language.TRADITIONAL_CHINESE]: `${student.lastName[Language.TRADITIONAL_CHINESE]}${student.firstName[Language.TRADITIONAL_CHINESE]}`,
      [Language.SIMPLIFIED_CHINESE]: `${student.lastName[Language.SIMPLIFIED_CHINESE]}${student.firstName[Language.SIMPLIFIED_CHINESE]}`,
    };
  };

  const name =
    'name' in object
      ? object.name
      : 'description' in object
        ? object.description
        : constuctStudentName(object);
  return languagePreference.map((lang) => name[lang]).find((text) => text !== undefined) ?? '';
};
