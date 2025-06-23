import {
  makeStyles,
  tokens,
  Dropdown,
  Option,
  Tooltip,
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
import { Root } from '../../components/container';
import { ProductGrid } from '../product/product-grid';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { PageTitle } from '../../components/page-title';
import { Pagination } from '../../components/pagination';

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

  const pagination = (
    <Pagination
      offset={currentPage * 5}
      onOffsetChanged={(offSet) => setCurrentPage(Math.floor(offSet / 5) + 1)}
      pageSize={5}
      totalRecord={20 * 5}
    />
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
