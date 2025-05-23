import * as React from 'react';
import {
  Switch as FluentSwitch,
  SwitchProps as FluentSwitchProps,
} from '@fluentui/react-components';

type SwitchProps = FluentSwitchProps & {
  readOnly?: boolean;
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ readOnly = false, checked, style, onChange, ...rest }, ref) => {
    return (
      <FluentSwitch
        checked={checked}
        onChange={readOnly ? undefined : onChange}
        style={style}
        {...rest}
        ref={ref}
      />
    );
  },
);

Switch.displayName = 'Switch';
