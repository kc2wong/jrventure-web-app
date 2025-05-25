import * as React from 'react';
import {
  DatePickerProps as FluentDatePickerProps,
  DatePicker as FluentDatePicker,
} from '@fluentui/react-datepicker-compat';

type DatePickerProps = {
  readOnly?: boolean;
  onChange?: (value: Date | null) => void;
} & FluentDatePickerProps;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ appearance, open, contentAfter, onSelectDate, onChange, readOnly = false, value, ...rest }, ref) => {
    return (
      <FluentDatePicker
        appearance={readOnly ? 'underline' : appearance}
        contentAfter={readOnly ? <></> : contentAfter}
        onSelectDate={(date) => {
          onChange?.(date ?? null);        // for RHF
          onSelectDate?.(date);            // original callback
        }}        
        open={readOnly ? false : open}
        value={value ? value : null}
        {...rest}
        ref={ref as any}
      />
    );
  },
);

DatePicker.displayName = 'DatePicker';
