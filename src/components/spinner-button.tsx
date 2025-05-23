import * as React from 'react';
import {
  SpinButton as FluentSpinButton,
  SpinButtonProps as FluentSpinButtonProps,
} from '@fluentui/react-components';

type SpinButtonProps = FluentSpinButtonProps & {
  readOnly?: boolean;
};

export const SpinButton = React.forwardRef<HTMLInputElement, SpinButtonProps>(
  ({ readOnly = false, onChange, incrementButton, decrementButton, appearance, ...rest }, ref) => {
    return (
      <FluentSpinButton
        appearance={readOnly ? 'underline' : appearance}
        decrementButton={readOnly ? <></> : decrementButton}
        incrementButton={readOnly ? <></> : incrementButton}
        onChange={readOnly ? undefined : onChange}
        {...rest}
        ref={ref}
      />
    );
  },
);

SpinButton.displayName = 'SpinButton';
