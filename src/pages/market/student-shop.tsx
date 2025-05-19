import * as React from 'react';
import {
  makeStyles,
  Text,
  tokens,
  Avatar,
  Button,
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
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useMessage } from '../../hooks/use-message';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import { ProductGrid } from '../product/product-grid';
import { authenticationAtom } from '../../states/authentication';
import { ApprovalStatus } from '../../__generated__/linkedup-web-api-client';
import {
  shopAtom,
  ShopStateInitial,
  ShopStateProgress,
  ShopStateSuccess,
} from '../../states/student-shop';
import { Root } from '../../components/Container';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { PageTitle } from '../../components/page-title';
import { Pagination } from '../../components/pagination';
import { DeviceComponent } from '../../components/device-component';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: tokens.spacingVerticalL,
    gap: tokens.spacingVerticalS,
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

  panels: {
    padding: '0 10px',
    '& th': {
      textAlign: 'left',
      padding: '0 30px 0 0',
    },
  },
});

export const StudentShopPage = () => {
  const styles = useStyles();
  const [state, action] = useAtom(shopAtom);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { showSpinner, stopSpinner } = useMessage();
  const { useStartBreadcrumb } = useBreadcrumb();

  const { login } = useAtomValue(authenticationAtom);
  const studentId = login?.user.entitledStudent[0].id;

  const { id } = useParams<{ id: string }>();
  const ownShop = id === studentId;

  const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  useEffect(() => {
    useStartBreadcrumb('My Shop');
  }, []);

  useEffect(() => {
    if (state instanceof ShopStateInitial) {
      action({ search: {} });
    } else if (state instanceof ShopStateProgress) {
      showSpinner();
    } else if (state instanceof ShopStateSuccess) {
      stopSpinner();
    }
  }, [state]);

  const CheckmarkStarburst = bundleIcon(CheckmarkStarburstFilled, CheckmarkStarburstRegular);
  const ApprovalsApp = bundleIcon(ApprovalsAppFilled, ApprovalsAppRegular);
  const DismissCircle = bundleIcon(DismissCircleFilled, DismissCircleRegular);

  const ApprovedGrid = React.memo(() => (
    <div aria-labelledby="ProductReview" role="tabpanel">
      <ProductGrid
        editAction={(_p) => () => {}}
        onSelectedForView={(product) => {
          action({ select: { product } });
          return `/shop/${product.id}/view`;
        }}
        products={(state.shop?.approvedProducts ?? []).filter((s) => s.sellerId === 'S000000571')}
      />
    </div>
  ));

  const pendingItems = (state.shop?.pendingProducts ?? [])?.filter(
    (item) => item.product.sellerId === studentId && item.status === ApprovalStatus.PENDING,
  );
  const rejectedItems = (state.shop?.rejectedProducts ?? [])?.filter(
    (item) => item.product.sellerId === studentId && item.status === ApprovalStatus.REJECTED,
  );

  const PendingGrid = React.memo(() => (
    <div aria-labelledby="PendingProduct" role="tabpanel">
      {pendingItems?.length === 0 ? (
        <Text>No Pending Product</Text>
      ) : (
        <ProductGrid
          editAction={(_p) => () => {}}
          onSelectedForView={(product) => {
            action({ select: { product } });
            return `/shop/${product.id}/view`;
          }}
          products={pendingItems
            .filter((s) => s.product.sellerId === 'S000000571')
            .map((s) => s.product)}
        />
      )}
    </div>
  ));

  const RejectedGrid = React.memo(() => (
    <div aria-labelledby="RejectedProduct" role="tabpanel">
      {rejectedItems?.length === 0 ? (
        <Text>No Rejected Product</Text>
      ) : (
        <ProductGrid
          editAction={(_p) => () => {}}
          onSelectedForView={(product) => {
            action({ select: { product } });
            return `/shop/${product.id}/view`;
          }}
          products={rejectedItems
            .filter((s) => s.product.sellerId === 'S000000571')
            .map((s) => s.product)}
        />
      )}
    </div>
  ));

  const pagination = (
    <Pagination onPageSelected={setCurrentPage} selectedPage={currentPage} totalPages={20} />
  );

  const imageUrl = state.shop?.imageUrl;
  const student = state.shop?.student;
  return (
    <Root>
      <div className={styles.container}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
            {/* Avatar Box */}
            <Avatar image={imageUrl ? { src: imageUrl } : undefined} size={64} />

            {/* Right box, matching avatar height */}
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <PageTitle>{useNameInPreferredLanguage(state.shop)}</PageTitle>
                <Subtitle1>{useNameInPreferredLanguage(student)}</Subtitle1>
              </div>
              {ownShop ? (
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
          <DeviceComponent desktop={pagination} mobile={<></>} />
        </div>

        {ownShop ? (
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

        <DeviceComponent desktop={<></>} mobile={pagination} />
      </div>
    </Root>
  );
};
