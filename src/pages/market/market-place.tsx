import {
  makeStyles,
  tokens,
  Dropdown,
  Option,
  Button,
  Title1,
  Tooltip,
  Title3,
  Tag,
  Caption1,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  ArrowSortDownLinesRegular,
  CheckmarkRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { useAtom } from 'jotai';
import {
  marketPlaceAtom,
  MarketPlaceStateInitial,
  MarketPlaceStateProgress,
  MarketPlaceStateSuccess,
} from '../../states/market-place';
import { useEffect, useState } from 'react';
import { useMessage } from '../../hooks/use-message';
import { DeviceComponent } from '../../components/device-component';
import { useTranslation } from 'react-i18next';
import { Root } from '../../components/Container';
import { ProductGrid } from '../product/product-grid';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { PageTitle } from '../../components/page-title';

const useStyles = makeStyles({
  main: {
    gap: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: tokens.spacingVerticalM,
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },

  dropdown: {
    width: '120px',
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },

  toolbarLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  pagination: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },

  card: {
    width: '240px',
    maxWidth: '100%',
    height: 'fit-content',
  },

  caption: {
    color: tokens.colorNeutralForeground3,
  },

  flex: {
    gap: tokens.spacingHorizontalXS,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const MarketPlaceShowcase = () => {
  const styles = useStyles();
  const { showSpinner, stopSpinner } = useMessage();
  const { useStartBreadcrumb } = useBreadcrumb();
  const { t } = useTranslation();

  const [state, action] = useAtom(marketPlaceAtom);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pageNumbers = [1, 2, 3, 4, 5];
  const pagination = (
    <div className={styles.pagination}>
      {pageNumbers.map((page) => (
        <div
          key={page}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '32px',
          }}
        >
          <Button
            appearance="transparent"
            onClick={() => setCurrentPage(page)}
            style={{
              minWidth: 0,
              width: '32px',
              height: '32px',
              padding: '4px',
              fontWeight: currentPage === page ? 'bold' : 'normal',
            }}
          >
            {page}
          </Button>
          {currentPage === page && (
            <div
              style={{
                height: '2px',
                backgroundColor: tokens.colorBrandForeground1,
                width: '100%',
                borderRadius: '1px',
              }}
            />
          )}
        </div>
      ))}
      <Button
        appearance="transparent"
        onClick={() => setCurrentPage(pageNumbers.length)}
        style={{ minWidth: 0, width: '32px', height: '32px', padding: '4px' }}
      >
        ...
      </Button>
      <Button
        appearance="transparent"
        onClick={() => setCurrentPage(pageNumbers.length)}
        style={{ minWidth: 0, width: '48px', height: '32px', padding: '4px' }}
      >
        Last
      </Button>
    </div>
  );

  useEffect(() => {
    useStartBreadcrumb('marketPlace.title');
  }, []);

  useEffect(() => {
    if (state instanceof MarketPlaceStateInitial) {
      action({ search: {} });
    } else if (state instanceof MarketPlaceStateProgress) {
      showSpinner();
    } else if (state instanceof MarketPlaceStateSuccess) {
      stopSpinner();
    }
  }, [state]);

  return (
    <Root>
      <div className={styles.container}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
          <PageTitle>{t('marketPlace.title')}</PageTitle>
          <Tooltip content={t('Search')} relationship="label" withArrow>
            <SearchRegular fontSize={20} />
          </Tooltip>
          <Tooltip content={t('system.message.refresh')} relationship="label" withArrow>
            <ArrowClockwiseRegular fontSize={20} />
          </Tooltip>
        </div>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <DeviceComponent
              desktop={
                <>
                  <Dropdown placeholder="Category">
                    <Option>All</Option>
                    <Option>Phones</Option>
                    <Option>Tablets</Option>
                    <Option>Accessories</Option>
                  </Dropdown>
                  <Dropdown placeholder="Ordering">
                    <Option>Rating</Option>
                    <Option>Buyers</Option>
                    <Option>Cost</Option>
                  </Dropdown>
                </>
              }
              mobile={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  >
                    <Caption1 style={{ minWidth: 50 }}>Filter</Caption1>
                    <Tag icon={<CheckmarkRegular />} size="small">
                      Tablets
                    </Tag>
                    <Tag icon={<CheckmarkRegular />} size="small">
                      Phones
                    </Tag>
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  >
                    <div style={{ minWidth: 50 }}>
                      <Caption1>Ordering</Caption1>
                    </div>
                    <Tag icon={<ArrowSortDownLinesRegular />} size="small">
                      Rating
                    </Tag>
                  </div>
                </div>
              }
            />
          </div>

          <DeviceComponent desktop={pagination} mobile={<></>} />
        </div>

        <div className={styles.main}>
          <ProductGrid
            editAction={(_p) => undefined}
            onSelectedForView={(product) => {
              action({ select: { product } });
              return `/market/${product.id}/view`;
            }}
            products={state.getResult() ?? []}
          />
        </div>

        <DeviceComponent desktop={<></>} mobile={pagination} />
      </div>
    </Root>
  );
};
