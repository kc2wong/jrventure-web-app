import * as React from 'react';
import {
  DatePickerProps as FluentDatePickerProps,
  DatePicker as FluentDatePicker,
} from '@fluentui/react-datepicker-compat';

type DatePickerProps = {
  readOnly?: boolean;
} & FluentDatePickerProps;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ appearance, open, contentAfter, readOnly = false, ...rest }, ref) => {
    return (
      <FluentDatePicker
        appearance={readOnly ? 'underline' : appearance}
        contentAfter={readOnly ? <></> : contentAfter}
        open={readOnly ? false : open}
        {...rest}
        ref={ref as any}
      />
    );
  },
);

DatePicker.displayName = 'DatePicker';
