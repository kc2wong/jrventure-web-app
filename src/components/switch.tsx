import * as React from 'react';
import {
  Input,
  Switch as FlientUiSwitch,
  SwitchProps as FluentUiSwitchProps,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';

type SwitchProps = FluentUiSwitchProps & {
  readOnly?: boolean;
};

export const Switch: React.FC<SwitchProps> = ({ readOnly = false, checked, ...rest }) => {
  const { t } = useTranslation();
  return readOnly ? (
    <Input
      appearance="underline"
      readOnly
      value={`${checked === true ? t('system.message.yes') : t('system.message.no')}`}
    />
  ) : (
    <FlientUiSwitch checked={checked} {...rest}></FlientUiSwitch>
  );
};
