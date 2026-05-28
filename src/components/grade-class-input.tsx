import { JrVcInputDropdown } from '@component/jr-venture-input';
import { authUserAtom } from '@store/auth/auth-bloc';
import { referenceDataStateAtom } from '@store/reference-data/reference-data-bloc';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

type EntitledDropdownProps = {
  disabled?: boolean;
  errorMessage?: string;
  hint?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: string[] | null;
  onChange: (value: string[] | null) => void;
};

const GradeDropdown = ({
  disabled,
  errorMessage,
  hint,
  label,
  onChange,
  placeholder,
  readOnly,
  required,
  value,
}: EntitledDropdownProps) => {
  const authUser = useAtomValue(authUserAtom);
  const gradeOptions = useMemo(
    () =>
      (authUser?.grades ?? [])
        .slice()
        .sort((a, b) => a - b)
        .map((g) => ({ text: String(g), value: String(g) })),
    [authUser?.grades],
  );

  return (
    <JrVcInputDropdown
      disabled={disabled || gradeOptions.length === 0}
      errorMessage={errorMessage}
      hint={hint}
      label={label}
      multiselect
      onChange={(v) => onChange((v as string[]) ?? null)}
      options={gradeOptions}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      value={value}
    />
  );
};

const ClassDropdown = ({
  disabled,
  errorMessage,
  hint,
  label,
  onChange,
  placeholder,
  readOnly,
  required,
  value,
}: EntitledDropdownProps) => {
  const authUser = useAtomValue(authUserAtom);
  const { classes } = useAtomValue(referenceDataStateAtom);
  const classOptions = useMemo(() => {
    const entitlement = authUser?.entitlement;
    const restrictedClassIds =
      entitlement && 'isForAllClasses' in entitlement && !entitlement.isForAllClasses
        ? new Set(entitlement.classIds)
        : null;
    return classes
      .filter((c) => restrictedClassIds === null || restrictedClassIds.has(c.id))
      .map((c) => ({ text: `${c.grade}${c.classNumber}`, value: c.id }));
  }, [classes, authUser?.entitlement]);

  return (
    <JrVcInputDropdown
      disabled={disabled || classOptions.length === 0}
      errorMessage={errorMessage}
      hint={hint}
      label={label}
      listbox={{ style: { maxHeight: '30vh', overflowY: 'auto' } }}
      multiselect
      onChange={(v) => onChange((v as string[]) ?? null)}
      options={classOptions}
      placeholder={placeholder}
      positioning={{ autoSize: false }}
      readOnly={readOnly}
      required={required}
      value={value}
    />
  );
};

export { ClassDropdown, GradeDropdown };
export type { EntitledDropdownProps };