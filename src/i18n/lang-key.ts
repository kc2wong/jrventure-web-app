import type { MultiLanguageName } from '@openapi/types.gen';

const isoToLangKey = (isoCode: string): keyof MultiLanguageName =>
  (isoCode === 'zh-Hant'
    ? 'zhHant'
    : isoCode === 'zh-Hans'
      ? 'zhHans'
      : isoCode) as keyof MultiLanguageName;

export { isoToLangKey };
