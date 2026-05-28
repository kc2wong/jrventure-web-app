import { SearchButton } from '@component/jr-venture-button';
import { Button, Title1, makeStyles, tokens } from '@fluentui/react-components';
import { FuiButtonPanel } from 'handy-fluentui';
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
      <Title1>{t('general.text.filter', { entityName })}</Title1>
      {children}
      <FuiButtonPanel>
        <Button onClick={onCancel}>{t('general.text.cancel')}</Button>
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

