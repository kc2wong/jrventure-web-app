import { formatDateDDMMYYYY } from '@util/date-util';
import {
  FuiInputDate,
  FuiInputGroup,
  FuiInputTime,
  FuiInputDropdown,
  FuiInputMultiLangText,
  FuiInputNumber,
  FuiInputText,
  type InputDateProps,
  type InputMultiLangTextProps,
  type InputTextProps,
  useTimeZone,
} from 'handy-fluentui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type WithReadOnlyUnderlineProps = {
  readOnly?: boolean;
  appearance?: string;
};

const withReadOnlyUnderline = <P extends WithReadOnlyUnderlineProps>(
  Component: React.ComponentType<P>,
) => {
  return (props: P) => {
    const { readOnly, appearance, ...rest } = props;

    return (
      <Component
        {...(rest as P)}
        appearance={readOnly ? 'underline' : appearance}
        readOnly={readOnly}
      />
    );
  };
};

const JrVcInputText = withReadOnlyUnderline(FuiInputText);
const JrVcInputNumber = withReadOnlyUnderline(FuiInputNumber);
const JrVcInputTime = withReadOnlyUnderline(FuiInputTime);
const JrVcInputDate = ({
  readOnly,
  value,
  onChange,
  ...rest
}: InputDateProps & { readOnly?: boolean }) => {
  if (readOnly) {
    return (
      <JrVcInputText
        {...(rest as unknown as InputTextProps)}
        onChange={() => {}}
        readOnly
        value={value ? formatDateDDMMYYYY(value) : null}
      />
    );
  }
  return <FuiInputDate {...rest} onChange={onChange} value={value} />;
};
const JrVcInputDropdown = withReadOnlyUnderline(FuiInputDropdown);
const JrVcInputMultiLangText = withReadOnlyUnderline(
  (props: InputMultiLangTextProps) => {
    const { t } = useTranslation();
    return (
      <FuiInputMultiLangText
        {...props}
        langLabel={{
          languages: [
            t('general.language.en'),
            t('general.language.zh-Hant'),
            t('general.language.zh-Hans'),
          ],
        }}
        textComponent={JrVcInputText}
      />
    );
  },
);

type LocalTime = { hour: number; minute: number; second: number };
type InputDateTimeProps = InputDateProps & { withSeconds?: boolean };

const JrVcInputDateTime = ({
  label,
  disabled,
  required,
  hint,
  errorMessage,
  infoMessage,
  noMessage,
  additionalMessage,
  clearable = true,
  value,
  onChange,
  readOnly,
  withSeconds = false,
  placeholder: _placeholder,
  ...rest
}: InputDateTimeProps) => {
  const { zonedDate2LocalDate } = useTimeZone();

  const localParts = value ? zonedDate2LocalDate(value) : null;
  const datePart: Date | null = localParts
    ? new Date(localParts.year, localParts.month - 1, localParts.day)
    : null;
  const timePart: LocalTime | null = localParts
    ? {
        hour: localParts.hour,
        minute: localParts.minute,
        second: localParts.second,
      }
    : null;

  // Convert (y, mo, d, h, mi, s) expressed in the context timezone to a UTC Date.
  // Strategy: "offset-probe" — no Temporal API needed.
  const toUTC = (
    y: number,
    mo: number,
    d: number,
    h: number,
    mi: number,
    s: number,
  ): Date => {
    // Step 1: Treat the local parts as if they were UTC to get a numeric anchor.
    //         This is intentionally "wrong" UTC — it is only a probe point.
    const probe = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
    // Step 2: Ask what the context timezone reads at that probe instant.
    //         e.g. probe = 15:00 UTC, context = UTC+8 → tz.hour = 23
    const tz = zonedDate2LocalDate(probe);
    // Step 3: delta = (local parts as UTC ms) − (what TZ reads at probe as UTC ms)
    //         = input − tz(probe) = 15:00 − 23:00 = −8 h  (for UTC+8)
    const delta =
      Date.UTC(y, mo - 1, d, h, mi, s) -
      Date.UTC(tz.year, tz.month - 1, tz.day, tz.hour, tz.minute, tz.second);
    // Step 4: probe + delta = 15:00 UTC + (−8 h) = 07:00 UTC ✓
    return new Date(probe.getTime() + delta);
  };

  const handleDateChange = (newDate: Date | null | undefined) => {
    if (!newDate) {
      onChange(null);
      return;
    }
    const t = timePart ?? { hour: 0, minute: 0, second: 0 };
    onChange(
      toUTC(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        newDate.getDate(),
        t.hour,
        t.minute,
        t.second,
      ),
    );
  };

  const handleTimeChange = (newTime: LocalTime | null) => {
    if (!localParts) {
      return;
    }
    const t = newTime ?? { hour: 0, minute: 0, second: 0 };
    onChange(
      toUTC(
        localParts.year,
        localParts.month,
        localParts.day,
        t.hour,
        t.minute,
        t.second,
      ),
    );
  };

  // Peel off FieldLayoutProps direction/labelWidth from the remaining DatePicker props
  const { direction, labelWidth, ...datePickerProps } = rest as typeof rest & {
    direction?: 'vertical' | 'horizontal';
    labelWidth?: 'small' | 'medium' | 'large' | 'none';
  };

  return (
    <FuiInputGroup
      {...(direction === 'horizontal'
        ? { direction: 'horizontal' as const, labelWidth }
        : {})}
      additionalMessage={additionalMessage}
      clearable={clearable && !(readOnly || disabled)}
      hint={hint}
      infoMessage={infoMessage}
      items={[
        {
          element: (
            <JrVcInputDate
              {...datePickerProps}
              disabled={disabled}
              errorMessage={errorMessage}
              onChange={handleDateChange}
              placeholder="Date"
              readOnly={readOnly}
              value={datePart}
            />
          ) as unknown as React.ReactElement<any>,
          weight: 1,
        },
        {
          element: (
            <JrVcInputTime
              disabled={readOnly ? disabled : (disabled || datePart === null)}
              onChange={handleTimeChange}
              placeholder="Time"
              readOnly={readOnly}
              value={timePart}
              withSeconds={withSeconds}
            />
          ) as unknown as React.ReactElement<any>,
          weight: 1,
        },
      ]}
      label={label ?? ''}
      noMessage={noMessage}
      required={required}
    />
  );
};

export {
  JrVcInputText,
  JrVcInputMultiLangText,
  JrVcInputNumber,
  JrVcInputDate,
  JrVcInputTime,
  JrVcInputDateTime,
  JrVcInputDropdown,
};
