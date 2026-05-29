import type { MultiLanguageName } from '@openapi/index.schemas';

const isoToLangKey = (isoCode: string): keyof MultiLanguageName =>
  (isoCode === 'zh-Hant'
    ? 'zhHant'
    : isoCode === 'zh-Hans'
      ? 'zhHans'
      : isoCode) as keyof MultiLanguageName;

export { isoToLangKey };
