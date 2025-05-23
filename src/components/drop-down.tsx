import * as React from 'react';
import {
  Dropdown as FluentDropdown,
  DropdownProps as FluentDropdownProps,
} from '@fluentui/react-components';

export type DropdownProps = FluentDropdownProps & {
  readOnly?: boolean;
};

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  ({ readOnly = false, appearance, open, expandIcon, onChange, children, ...rest }, ref) => {
    return (
      <FluentDropdown
        ref={ref}
        appearance={readOnly ? 'underline' : appearance}
        expandIcon={readOnly ? <></> : expandIcon}
        onChange={readOnly ? undefined : onChange}
        open={readOnly ? false : open}
        {...rest}
      >
        {children}
      </FluentDropdown>
    );
  },
);

Dropdown.displayName = 'Dropdown';
