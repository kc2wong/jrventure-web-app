import { JrVcInputText } from '@component/jr-venture-input';
import { Spinner } from '@fluentui/react-components';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import { findStudent } from '@openapi/sdk.gen';
import type { Student } from '@store/student/student-types';
import type { InputTextProps } from 'handy-fluentui';
import { type Ref, useEffect, useImperativeHandle, useReducer, useRef } from 'react';

type StudentLookup = {
  status: 'idle' | 'looking' | 'valid' | 'invalid';
  student?: Student;
};

type StudentIdInputTextRef = {
  triggerLookup: () => Promise<boolean>;
};

type StudentIdInputTextProps = Omit<InputTextProps, 'contentAfter' | 'infoMessage' | 'onChange'> & {
  ref?: Ref<StudentIdInputTextRef>;
  onChange?: (value: string | null) => void;
  onLookupChange?: (lookup: StudentLookup) => void;
};

const StudentIdInputText = ({
  ref,
  onChange,
  onLookupChange,
  readOnly,
  value,
  ...rest
}: StudentIdInputTextProps) => {
  const { fullNameInPreferredLanguage } = usePreferredLanguage();

  // Tracks current lookup state in a ref so doLookup can read latest without stale closure
  const lookupRef = useRef<StudentLookup>({ status: 'idle' });
  // Tracks whether the last value change was caused by the user typing (onChange)
  const changedInternallyRef = useRef(false);
  // Forces re-render when lookup state changes
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  const updateLookup = (next: StudentLookup) => {
    lookupRef.current = next;
    onLookupChange?.(next);
    forceUpdate();
  };

  const doLookup = async (id: string | null): Promise<boolean> => {
    const trimmed = id?.trim() ?? '';
    if (!trimmed) {
      updateLookup({ status: 'idle' });
      return false;
    }
    updateLookup({ status: 'looking' });
    const { data: result } = await findStudent({ query: { id: [trimmed], limit: 1, skip: 0 } });
    const found = result?.items?.[0] as Student | undefined;
    const next: StudentLookup = found ? { status: 'valid', student: found } : { status: 'invalid' };
    updateLookup(next);
    return !!found;
  };

  useEffect(() => {
    if (changedInternallyRef.current) {
      changedInternallyRef.current = false;
      return;
    }
    void doLookup(value);
  }, [value]);

  useImperativeHandle(ref, () => ({
    triggerLookup: () => doLookup(value),
  }));

  const lookup = lookupRef.current;
  const studentName = lookup.student
    ? fullNameInPreferredLanguage(lookup.student.firstName, lookup.student.lastName) || undefined
    : undefined;

  return (
    <JrVcInputText
      // Cast required: Omit<InputTextProps, ...> flattens the discriminated union on
      // direction/labelWidth from FieldLayoutProps, making the spread no longer
      // directly assignable to InputTextProps without the cast.
      {...(rest as InputTextProps)}
      contentAfter={lookup.status === 'looking' ? <Spinner size="tiny" /> : undefined}
      infoMessage={studentName}
      onBlur={readOnly ? undefined : () => void doLookup(value)}
      onChange={(val) => {
        changedInternallyRef.current = true;
        updateLookup({ status: 'idle' });
        onChange?.(val);
      }}
      readOnly={readOnly}
      value={value}
    />
  );
};

export { StudentIdInputText };
export type { StudentIdInputTextProps, StudentIdInputTextRef, StudentLookup };
