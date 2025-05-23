import * as React from 'react';
import {
  CheckboxProps as FluentCheckboxPropx,
  Checkbox as FluentCheckbox,
} from '@fluentui/react-components';

type CheckboxProps = {
  readOnly?: boolean;
} & FluentCheckboxPropx;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ onChange, readOnly = false, ...rest }, ref) => {
    return <FluentCheckbox onChange={readOnly ? undefined : onChange} {...rest} ref={ref as any} />;
  },
);

Checkbox.displayName = 'Checkbox';
