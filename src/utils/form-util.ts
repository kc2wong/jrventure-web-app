import type { MultiLanguageName } from '@openapi/types.gen';
import type { MultiLangText } from 'handy-fluentui';

const EMPTY_MULTI_LANG_TEXT: MultiLangText = {
  valueInLangOne: '',
  valueInLangTwo: '',
  valueInLangThree: '',
};

const nullToEmpty = (source: MultiLangText | null): MultiLangText => {
  if (source === null) {
    return EMPTY_MULTI_LANG_TEXT;
  }
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, value ?? '']),
  ) as MultiLangText;
};

const multiLangNameToText = (name: MultiLanguageName): MultiLangText =>
  nullToEmpty({
    valueInLangOne: name.en ?? null,
    valueInLangTwo: name.zhHant ?? null,
    valueInLangThree: name.zhHans ?? null,
  });

const multiLangTextToName = (text: MultiLangText): MultiLanguageName =>
  ({
    en: text.valueInLangOne || undefined,
    zhHant: text.valueInLangTwo || undefined,
    zhHans: text.valueInLangThree || undefined,
  }) as MultiLanguageName;

export {
  EMPTY_MULTI_LANG_TEXT,
  multiLangNameToText,
  multiLangTextToName,
};
