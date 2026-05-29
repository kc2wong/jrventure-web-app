import { CancelButton } from '@component/jr-venture-button';
import { JrVcInputNumber, JrVcInputText } from '@component/jr-venture-input';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import {
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  classEditActionAtom,
  classEditStateAtom,
} from '@store/class/class-edit-bloc';
import { FuiButtonPanel, useBreadcrumb, useIsMobile } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    '& > *:last-child': {
      paddingTop: tokens.spacingVerticalM,
    },
  },
  rootDesktop: {
    maxWidth: '60vw',
  },
});

const ClassEditPage = ({
  id,
  mode,
  onExit,
}: MaintenanceEditPageProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { append, items } = useBreadcrumb();

  const dispatch = useSetAtom(classEditActionAtom);
  const { data } = useAtomValue(classEditStateAtom);

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
    if (id && data?.id !== id) {
      dispatch({ type: 'GET', id });
    }
  }, [id, data?.id]);

  return (
    <div
      className={mergeClasses(
        styles.root,
        isMobile ? undefined : styles.rootDesktop,
      )}
    >
      <JrVcInputNumber
        label={t('class.grade')}
        onChange={() => undefined}
        readOnly
        value={data?.grade ?? null}
      />

      <JrVcInputText
        label={t('class.classNumber')}
        onChange={() => undefined}
        readOnly
        value={data?.classNumber.toString() ?? ''}
      />

      <FuiButtonPanel>
        <CancelButton onClick={onExit} />
      </FuiButtonPanel>
    </div>
  );
};

export { ClassEditPage };
