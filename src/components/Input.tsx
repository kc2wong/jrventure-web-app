import { forwardRef } from 'react';
import { Input as FluentUiInput, InputProps } from '@fluentui/react-components';
import { undefinedToEmptyString } from '../utils/object-util';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ appearance, readOnly, value, ...others }, ref) => {
    return (
      <FluentUiInput
        {...others}
        ref={ref}
        appearance={readOnly ? 'underline' : appearance}
        readOnly={readOnly}
        value={undefinedToEmptyString(value)}
      />
    );
  },
);

// Set the display name
Input.displayName = 'Input';
