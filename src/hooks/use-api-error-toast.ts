import { latestApiErrorAtom } from '@store/latest-api-error-atom';
import { useToast } from 'handy-fluentui';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const useApiErrorToast = () => {
  const error = useAtomValue(latestApiErrorAtom);
  const toast = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!error) { return; }
    const params = Object.fromEntries((error.parameter ?? []).map((v, i) => [String(i), v]));
    const msg = t(`apiError.${error.code}`, { defaultValue: error.message, ...params });
    toast.error(msg);
  }, [error?.id]);
};

export { useApiErrorToast };
