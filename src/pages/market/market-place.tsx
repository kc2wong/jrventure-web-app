import {
  makeStyles,
  tokens,
  Dropdown,
  Option,
  Button,
  Title1,
  Tooltip,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, SearchRegular } from '@fluentui/react-icons';
import { useAtom } from 'jotai';
import {
  productListAtom,
  ProductListStateInitial,
  ProductListStateProgress,
  ProductListStateSuccess,
} from '../../states/product-list';
import { useEffect, useState } from 'react';
import { useMessage } from '../../hooks/use-message';
import { t } from 'i18next';
import { ProductCard } from '../product/product-card';

const useStyles = makeStyles({
  main: {
    gap: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: tokens.spacingHorizontalXXL,
  },

  dropdown: {
    width: '120px',
  },

  header: {
    fontSize: '32px',
    fontWeight: 'bold',
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

  labels: { gap: '6px' },

  footer: { gap: '12px', justifyContent: 'space-between' },

  smallRadius: { borderRadius: tokens.borderRadiusSmall },

  grayBackground: {
    backgroundColor: tokens.colorNeutralBackground3,
  },

  logoBadge: {
    padding: '5px',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: '#FFF',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
  },
});


export const MarketPlaceShowcase = () => {
  const styles = useStyles();
  const [state, action] = useAtom(productListAtom);
  // const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { showSpinner, stopSpinner } = useMessage();

  const pageNumbers = [1, 2, 3, 4, 5]; // Example only, update dynamically as needed

  // const handleSelectionChange = (id: string, isSelected: boolean) => {
  //   setSelected((prev) => ({ ...prev, [id]: isSelected }));
  // };

  useEffect(() => {
    if (state instanceof ProductListStateInitial) {
      action({ search: {} });
    } else if (state instanceof ProductListStateProgress) {
      showSpinner();
    } else if (state instanceof ProductListStateSuccess) {
      stopSpinner();
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <Title1>Market Place</Title1>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
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
          <Tooltip content={t('Search')} relationship="label" withArrow>
            <SearchRegular fontSize={20} />
          </Tooltip>
          <Tooltip content={t('system.message.refresh')} relationship="label" withArrow>
            <ArrowClockwiseRegular fontSize={20} />
          </Tooltip>
        </div>
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
      </div>

      {/* Product Grid */}
      <div className={styles.main}>
        {(state.getResult() ?? []).map((product) => (
          <ProductCard
            key={product.id}
            // onSelect={(isSelected) => handleSelectionChange(product.id, isSelected)}
            product={product}
            // selected={!!selected[product.id]}
          />
        ))}
      </div>
    </div>
  );
};
