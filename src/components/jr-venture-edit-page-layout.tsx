import { JrVcGrid } from '@component/jr-venture-grid';
import { JrVcInputDate, JrVcInputText } from '@component/jr-venture-input';
import type { MaintenanceEditMode } from '@component/with-maintenance-page';
import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { ChevronDownRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import type { Auditible } from '@openapi/types.gen';
import { useIsMobile, useBreadcrumb, type FuiButtonPanel } from 'handy-fluentui';
import type { CSSProperties, ComponentProps, ReactElement, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  auditToggle: {
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    display: 'flex',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacingHorizontalS,
    padding: '0',
    ':hover': {
      color: tokens.colorNeutralForeground1,
    },
  },
  auditContent: {
    marginTop: tokens.spacingVerticalM,
  },
  chevron: {
    transition: 'transform 0.2s ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
});

type JrVcEditPageLayoutProps = {
  actionButtons: ReactElement<ComponentProps<typeof FuiButtonPanel>>;
  children: ReactNode;
  data: Auditible | null;
  desktopWidth?: Pick<CSSProperties, 'maxWidth' | 'minWidth' | 'width'>;
  entityName: string;
  mode: MaintenanceEditMode;
};

const JrVcEditPageLayout = ({
  actionButtons,
  children,
  data,
  desktopWidth,
  entityName,
  mode,
}: JrVcEditPageLayoutProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { fullNameInPreferredLanguage } = usePreferredLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { append } = useBreadcrumb();
  const appendedForPathRef = useRef<string | null>(null);

  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    if (appendedForPathRef.current !== pathname) {
      appendedForPathRef.current = pathname;
      append({
        action: () => navigate(pathname),
        label: () => t(`general.text.${mode}`, { entityName }),
        tag: pathname,
      });
    }
  }, [pathname, append, navigate, t, mode, entityName]);

  return (
    <div className={styles.root} style={isMobile ? undefined : { ...desktopWidth }}>
      {children}

      {mode !== 'add' && data && (
        <div>
          <button
            className={styles.auditToggle}
            onClick={() => setAuditOpen((prev) => !prev)}
            type="button"
          >
            <ChevronDownRegular
              className={mergeClasses(styles.chevron, auditOpen && styles.chevronOpen)}
              fontSize={16}
            />
            {t('general.audit.title')}
          </button>

          {auditOpen && (
            <JrVcGrid className={styles.auditContent} columns={2}>
              <JrVcInputText
                label={t('general.audit.createdBy')}
                onChange={() => {}}
                readOnly
                value={fullNameInPreferredLanguage(
                  data.createdBy.firstName,
                  data.createdBy.lastName,
                )}
              />
              <JrVcInputDate
                label={t('general.audit.createdAt')}
                onChange={() => {}}
                readOnly
                value={new Date(data.createdAt)}
              />
              <JrVcInputText
                label={t('general.audit.updatedBy')}
                onChange={() => {}}
                readOnly
                value={fullNameInPreferredLanguage(
                  data.updatedBy.firstName,
                  data.updatedBy.lastName,
                )}
              />
              <JrVcInputDate
                label={t('general.audit.updatedAt')}
                onChange={() => {}}
                readOnly
                value={new Date(data.updatedAt)}
              />
              <JrVcInputText
                label={t('general.audit.version')}
                onChange={() => {}}
                readOnly
                value={String(data.version)}
              />
            </JrVcGrid>
          )}
        </div>
      )}

      {actionButtons}
    </div>
  );
};

export { JrVcEditPageLayout };
export type { JrVcEditPageLayoutProps };
