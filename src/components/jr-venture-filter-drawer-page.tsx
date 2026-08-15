import { SearchButton } from '@component/jr-venture-button';
import { makeStyles, tokens } from '@fluentui/react-components';
import { FuiButton, FuiButtonPanel, FuiTitle1 } from 'handy-fluentui';
import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  searchButton: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: tokens.spacingVerticalL,
  },
});

type JrVcFilterFormProps = {
  children: ReactNode;
  onSearch: () => void;
};

type JrVcFilterPageProps = {
  children: ReactNode;
  entityName: string;
  onCancel: () => void;
};

const JrVcFilterForm = ({ children, onSearch }: JrVcFilterFormProps) => {
  const styles = useStyles();
  return (
    <div className={styles.form}>
      {children}
      <div className={styles.searchButton}>
        <SearchButton onClick={onSearch} />
      </div>
    </div>
  );
};

const JrVcFilterPage = ({
  children,
  entityName,
  onCancel,
}: JrVcFilterPageProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <FuiTitle1 text={t('general.text.filter', { entityName })} />
      {children}
      <FuiButtonPanel>
        <FuiButton onClick={onCancel}>{t('general.text.cancel')}</FuiButton>
      </FuiButtonPanel>
    </div>
  );
};

type WithFilterPageOptions = {
  entityNameKey: string;
  returnPath: string;
};

const withFilterPage = (
  FilterForm: ComponentType<{ onSearch?: () => void }>,
  options: WithFilterPageOptions,
) => {
  const FilterPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();

    if (!location.state?.fromSearch) {
      return <Navigate replace to={options.returnPath} />;
    }

    return (
      <JrVcFilterPage
        entityName={t(options.entityNameKey as Parameters<typeof t>[0])}
        onCancel={() => navigate(options.returnPath)}
      >
        <FilterForm onSearch={() => navigate(options.returnPath)} />
      </JrVcFilterPage>
    );
  };
  return FilterPage;
};

export { JrVcFilterForm, JrVcFilterPage, withFilterPage };
export type { JrVcFilterFormProps, JrVcFilterPageProps, WithFilterPageOptions };

