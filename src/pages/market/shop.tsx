import * as React from 'react';
import {
  makeStyles,
  Text,
  tokens,
  Avatar,
  Button,
  Title3,
  Tooltip,
  Subtitle1,
  SelectTabData,
  SelectTabEvent,
  TabValue,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  AddCircleRegular,
  ApprovalsAppFilled,
  ApprovalsAppRegular,
  ArrowClockwiseRegular,
  bundleIcon,
  CheckmarkStarburstFilled,
  CheckmarkStarburstRegular,
  DismissCircleFilled,
  DismissCircleRegular,
  EditRegular,
} from '@fluentui/react-icons';
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
import { useParams } from 'react-router-dom';
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
    alignItems: 'end',
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

  panels: {
    padding: '0 10px',
    '& th': {
      textAlign: 'left',
      padding: '0 30px 0 0',
    },
  },
});

export const ShopPage = () => {
  const styles = useStyles();
  const [state, action] = useAtom(productListAtom);
  // const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { showSpinner, stopSpinner } = useMessage();

  const { id } = useParams<{ id: string }>();
  const ownStore = id === undefined;

  const pageNumbers = [1, 2, 3, 4, 5]; // Example only, update dynamically as needed

  // const handleSelectionChange = (id: string, isSelected: boolean) => {
  //   setSelected((prev) => ({ ...prev, [id]: isSelected }));
  // };

  const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  useEffect(() => {
    if (state instanceof ProductListStateInitial) {
      action({ search: {} });
    } else if (state instanceof ProductListStateProgress) {
      showSpinner();
    } else if (state instanceof ProductListStateSuccess) {
      stopSpinner();
    }
  }, [state]);

  const CheckmarkStarburst = bundleIcon(CheckmarkStarburstFilled, CheckmarkStarburstRegular);
  const ApprovalsApp = bundleIcon(ApprovalsAppFilled, ApprovalsAppRegular);
  const DismissCircle = bundleIcon(DismissCircleFilled, DismissCircleRegular);
  

  const ApprovedGrid = React.memo(() => (
    <div aria-labelledby="ProductReview" role="tabpanel">
      <div className={styles.main}>
        {(state.getResult() ?? [])
          .filter((s) => s.seller === 'Dominic Kwok')
          .map((product) => (
            <ProductCard
              key={product.id}
              editAction={() => {}}
              product={product}
            />
          ))}
      </div>
    </div>
  ));

  const PendingGrid = React.memo(() => (
    <div aria-labelledby="PendingProduct" role="tabpanel">
      <Text>No Pending Product</Text>
    </div>
  ));

  const RejectedGrid = React.memo(() => (
    <div aria-labelledby="RejectedProduct" role="tabpanel">
      <Text>No Rejected Product</Text>
    </div>
  ));

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
          {/* Avatar Box */}
          <Avatar
            image={{
              src: 'https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/cat_avatar.jpeg',
            }}
            size={64}
          />

          {/* Right box, matching avatar height */}
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <div
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <Title3>Welcome to my Super Store</Title3>
              <Subtitle1>1F-18 Dominic Kwok</Subtitle1>
            </div>
            {ownStore ? (
              <>
                <Tooltip content={'Add new product'} relationship="label" withArrow>
                  <Button appearance="transparent" icon={<AddCircleRegular />}></Button>
                </Tooltip>
                <Tooltip content={'Edit Profile'} relationship="label" withArrow>
                  <Button appearance="transparent" icon={<EditRegular />}></Button>
                </Tooltip>
                <Tooltip content={t('system.message.refresh')} relationship="label" withArrow>
                  <Button appearance="transparent" icon={<ArrowClockwiseRegular />}></Button>
                </Tooltip>
              </>
            ) : (
              <></>
            )}
          </div>
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

      {ownStore ? (
        <>
          <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
            <Tab icon={<CheckmarkStarburst />} value="tab1">
              Approved
            </Tab>
            <Tab icon={<ApprovalsApp />} value="tab2">
              Pending
            </Tab>
            <Tab icon={<DismissCircle />} value="tab3">
              Rejected
            </Tab>
          </TabList>

          <div className={styles.panels}>
            {selectedValue === 'tab1' && <ApprovedGrid />}
            {selectedValue === 'tab2' && <PendingGrid />}
            {selectedValue === 'tab3' && <RejectedGrid />}
          </div>
        </>
      ) : (
        <ApprovedGrid />
      )}
    </div>
  );
};
