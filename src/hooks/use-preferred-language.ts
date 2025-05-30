import { useTranslation } from 'react-i18next';
import { Student, User, Shop, SimpleUser, Activity, ActivityCategory } from '../models/openapi';
import { getFieldValueInPreferredLanguage } from '../utils/language-util';

export const useNameInPreferredLanguage = (
  object: Student | SimpleUser | User | Shop | ActivityCategory | Activity | undefined,
): string => {
  const { i18n } = useTranslation();

  if (object === undefined) {
    return '';
  }
  if ('name' in object) {
    return getFieldValueInPreferredLanguage(i18n.language, 'name', object);
  } else if ('description' in object) {
    return getFieldValueInPreferredLanguage(i18n.language, 'description', object);
  }
  return '';
};
