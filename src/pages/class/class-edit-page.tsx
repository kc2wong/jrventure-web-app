import { CancelButton, SaveButton } from '@component/jr-venture-button';
import { JrVcInputNumber, JrVcInputText } from '@component/jr-venture-input';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import {
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  classEditActionAtom,
  classEditStateAtom,
} from '@store/class/class-edit-bloc';
import { classListActionAtom } from '@store/class/class-list-bloc';
import { FuiButtonPanel, useBreadcrumb, useIsMobile } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    // extra padding top for button panel
    '& > *:last-child': {
      paddingTop: tokens.spacingVerticalM,
    },
  },
  rootDesktop: {
    maxWidth: '60vw',
  },
});

type ClassFormValues = {
  grade: number;
  classNumber: string;
};

const ClassEditPage = ({
  id,
  mode,
  onExit,
}: MaintenanceEditPageProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { append, items } = useBreadcrumb();

  const dispatch = useSetAtom(classEditActionAtom);
  const listDispatch = useSetAtom(classListActionAtom);
  const { data } = useAtomValue(classEditStateAtom);

  const classSchema = useMemo(
    () =>
      z.object({
        grade: z
          .number({ error: t('validation.required') })
          .int()
          .min(1, t('validation.outOfRange', { min: 1, max: 6 }))
          .max(6, t('validation.outOfRange', { min: 1, max: 6 })),
        classNumber: z.string().min(1, t('validation.required')),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { isSubmitted },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: { grade: undefined, classNumber: '' },
  });

  useEffect(() => {
    if (isSubmitted) {
      void trigger();
    }
  }, [i18n.language]);

  const breadcrumbTag = location.pathname;
  const currentTagInItems = items.some((item) => item.tag === breadcrumbTag);
  useEffect(() => {
    if (!currentTagInItems) {
      append({
        action: () => navigate(breadcrumbTag),
        label: () =>
          t(`general.text.${mode}`, { entityName: t('class.title') }),
        tag: breadcrumbTag,
      });
    }
  }, [currentTagInItems, breadcrumbTag]);

  useEffect(() => {
    if (mode === 'add') {
      dispatch({ type: 'RESET' });
    } else if (id && data?.id !== id) {
      dispatch({ type: 'GET', id });
    }
  }, [id, mode, data?.id]);

  useEffect(() => {
    if (data) {
      reset({ grade: data.grade, classNumber: data.classNumber.toString() });
    } else {
      reset({ grade: undefined, classNumber: '' });
    }
  }, [data]);

  const isReadOnly = mode === 'view';

  const onSubmit = async (values: ClassFormValues) => {
    const payload = { grade: values.grade, classNumber: values.classNumber };
    if (mode === 'add') {
      await dispatch({ type: 'CREATE', payload });
    } else if (id) {
      await dispatch({ type: 'UPDATE', payload: { id, ...payload } });
    }
    listDispatch({ type: 'INVALIDATE' });
    onExit();
  };

  return (
    <div
      className={mergeClasses(
        styles.root,
        isMobile ? undefined : styles.rootDesktop,
      )}
    >
      <Controller
        control={control}
        name="grade"
        render={({ field, fieldState }) => (
          <JrVcInputNumber
            errorMessage={fieldState.error?.message}
            label={t('class.grade')}
            max={6}
            min={1}
            onChange={(value) => field.onChange(value)}
            placeholder={t('class.gradePlaceholder')}
            readOnly={isReadOnly}
            required={!isReadOnly}
            step={1}
            value={field.value ?? null}
          />
        )}
      />

      <Controller
        control={control}
        name="classNumber"
        render={({ field, fieldState }) => (
          <JrVcInputText
            errorMessage={fieldState.error?.message}
            label={t('class.classNumber')}
            onChange={(value) => field.onChange(value ?? '')}
            placeholder={t('class.classNumberPlaceholder')}
            readOnly={isReadOnly}
            required={!isReadOnly}
            value={field.value}
          />
        )}
      />

      <FuiButtonPanel>
        <CancelButton onClick={onExit} />
        {!isReadOnly && <SaveButton onClick={handleSubmit(onSubmit)} />}
      </FuiButtonPanel>
    </div>
  );
};

export { ClassEditPage };
