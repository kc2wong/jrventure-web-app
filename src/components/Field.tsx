import {
  Caption1,
  FieldProps as FlientUiFieldProps,
  Field as FluentUiField,
  InfoLabel,
  Label,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components';
import { ErrorCircleFilled } from '@fluentui/react-icons';
import { cloneElement, CSSProperties, ReactElement, useId } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  column: { display: 'flex', flexDirection: 'column', gap: '2px' },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fromToRow: {
    display: 'grid',
    gridTemplateColumns: '47% 6% 47%',
    width: '100%',
    alignItems: 'center',
  },
  errorMessageCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: tokens.colorStatusDangerForeground1,
  },
  infoMessageSlot: {
    height: '15px',
  },
  errorIcon: {
    marginRight: '4px',
  },
  hint: {
    marginBottom: '15px',
    textAlign: 'right',
  },
  childWrapper: {
    marginLeft: tokens.spacingHorizontalL,
  },
});

export type FieldProps = Omit<FlientUiFieldProps, 'children'> & {
  children: ReactElement<any>;
  horizontal?: boolean;
  infoMessage?: string;
  label: string;
  labelHint?: string;
  colSpan?: number;
  indentChildren?: boolean;
  style?: CSSProperties;
  validationMessage?: string;
};

export const Field: React.FC<FieldProps> = ({
  children,
  horizontal,
  label,
  labelHint,
  colSpan,
  validationMessage: validationMessageKey,
  infoMessage,
  indentChildren,
  style,
  ...others
}: FieldProps) => {
  const { t } = useTranslation();
  const mergedStyle: CSSProperties = {
    ...style,
    ...(colSpan ? { gridColumn: `span ${colSpan}` } : {}),
  };

  const validationMessage = validationMessageKey ? t(validationMessageKey) : undefined;
  const styles = useStyles();
  if (horizontal ?? false) {
    const hint = infoMessage ? (
      <Caption1 align="end" italic>
        {infoMessage}
      </Caption1>
    ) : undefined;
    return (
      <FluentUiField
        className={styles.hint}
        hint={hint}
        label={label}
        orientation="horizontal"
        style={mergedStyle}
        validationMessage={validationMessage}
        {...others}
      >
        {children}
      </FluentUiField>
    );
  } else {
    // generate unique ID
    const id = children.props.id;
    const generatedId = id ?? useId();

    const labelComponent = labelHint ? (
      <InfoLabel
        htmlFor={generatedId}
        info={<>{labelHint} </>}
        infoButton={{ tabIndex: -1 }}
        required={others.required}
      >
        {label}
      </InfoLabel>
    ) : (
      <Label htmlFor={generatedId} required={others.required}>
        {label}
      </Label>
    );
    return (
      <div className={styles.column} style={mergedStyle}>
        <div className={styles.row}>
          {/* First Row: Label and Error Message */}
          {labelComponent}
          {validationMessage && (
            <div className={styles.errorMessageCell}>
              <ErrorCircleFilled className={styles.errorIcon} />
              <Text size={200}>{validationMessage}</Text>
            </div>
          )}
        </div>
        {/* Second Row: child */}
        <>
          {' '}
          {id ? (
            indentChildren === true ? (
              <div className={styles.childWrapper}>{children}</div>
            ) : (
              children
            )
          ) : indentChildren === true ? (
            <div className={styles.childWrapper}>{cloneElement(children, { id: generatedId })}</div>
          ) : (
            cloneElement(children, { id: generatedId })
          )}
        </>
        {/* Third Row: info message */}
        {infoMessage ? (
          <Caption1 align="end" italic>
            {infoMessage}
          </Caption1>
        ) : (
          <div className={styles.infoMessageSlot} />
        )}
      </div>
    );
  }
};

export type FromToFieldProps = Omit<FieldProps, 'children'> & {
  fromComponent: React.ReactElement;
  toComponent: React.ReactElement;
};

export const FromToField: React.FC<FromToFieldProps> = ({
  fromComponent,
  toComponent,
  ...rest
}) => {
  const styles = useStyles();

  return (
    <Field {...rest}>
      <div className={styles.fromToRow}>
        {fromComponent}
        <span style={{ textAlign: 'center' }}>–</span>
        {toComponent}
      </div>
    </Field>
  );
};
