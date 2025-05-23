import * as React from 'react';
import {
  RadioGroup as FluentRadioGroup,
  RadioGroupProps as FluentRadioGroupProps,
} from '@fluentui/react-components';

type CustomRadioGroupProps = {
  readOnly?: boolean;
} & FluentRadioGroupProps;

export const RadioGroup = React.forwardRef<HTMLDivElement, CustomRadioGroupProps>(
  ({ onChange, readOnly = false, children, ...rest }, ref) => {
    return (
      <FluentRadioGroup onChange={readOnly ? undefined : onChange} {...rest} ref={ref}>
        {children}
      </FluentRadioGroup>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
