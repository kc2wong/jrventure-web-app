import type { AppTranslations } from './types';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: AppTranslations;
    };
  }
}
