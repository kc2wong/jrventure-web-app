import React, { cloneElement } from 'react';
import { useAtomValue } from 'jotai';
import { Form, Root } from '../../components/container';
import {
  ArrowTurnUpLeftRegular,
  bundleIcon,
  HeartRegular,
  CommentRegular,
  CommentFilled,
  AppsListDetailFilled,
  AppsListDetailRegular,
  HeartFilled,
} from '@fluentui/react-icons';
import {
  Button,
  tokens,
  makeStyles,
  TabList,
  Tab,
  TabValue,
  SelectTabData,
  SelectTabEvent,
  Text,
  RatingDisplay,
  Caption2,
  Link,
  Subtitle2,
  Caption1,
} from '@fluentui/react-components';
import { t } from 'i18next';
import { EmptyCell } from '../../components/container';
import { Field } from '../../components/field';
import { useTimezone } from '../../hooks/use-timezone';
import { BsCoin } from 'react-icons/bs';
import { ImageCarousel } from '../../components/image-carousell';
import { ButtonPanel } from '../../components/button-panel';
import { ApprovalStatus, Product } from '../../__generated__/linkedup-web-api-client';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';
import { shopAtom } from '../../states/student-shop';
import { useLocation } from 'react-router-dom';
import { PageTitle } from '../../components/page-title';

const AppsListDetail = bundleIcon(AppsListDetailFilled, AppsListDetailRegular);
const Comment = bundleIcon(CommentFilled, CommentRegular);
const Heart = bundleIcon(HeartFilled, HeartRegular);

const useStyles = makeStyles({
  row: {
    display: 'flex',
    width: '100%',
  },
  col25: {
    width: '25%',
    textAlign: 'left',
  },
  col50Right: {
    width: '50%',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  panels: {
    padding: '0 10px',
    '& th': {
      textAlign: 'left',
      padding: '0 30px 0 0',
    },
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS, // small space between icon and text
  },
  commentWrapper: {
    marginLeft: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalXL,
  },
});

type ProductDetailProps = {
  product?: Product;
  showReview: boolean;
  showOrder: boolean;
  showShopLink: boolean;
  approvalStatus?: ApprovalStatus;
  buttons: React.ReactElement<typeof Button>[];
};

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product: inProduct,
  approvalStatus,
  showOrder,
  showReview,
  showShopLink,
  buttons,
}: ProductDetailProps) => {
  const { navigate, navigateWithSpinner } = useNavigationHelpers();
  const location = useLocation();
  const state = useAtomValue(shopAtom);

  const [selectedValue, setSelectedValue] = React.useState<TabValue>('tab1');

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  const { formatDatetime, formatDistanceToNow } = useTimezone();

  const styles = useStyles();
  const product: Product | undefined = inProduct
    ? inProduct
    : location.state
      ? (location.state as Product)
      : state.selectedProduct;

  const backButton =
    window.history.length > 1 ? (
      <Button
        icon={<ArrowTurnUpLeftRegular />}
        onClick={() => {
          navigate(-1);
        }}
      >
        {t('system.message.back')}
      </Button>
    ) : (
      <></>
    );

  const ProductDetail = React.memo(() =>
    product ? (
      <Form numColumn={2}>
        <br />
        <Field colSpan={2} indentChildren={true} label="Summary">
          <Text>{product.summary}</Text>
        </Field>

        <Field colSpan={2} indentChildren={true} label="Description">
          <Text block>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium accusamus voluptate
            autem? Recusandae alias corporis dicta quisquam sequi molestias deleniti, libero
            necessitatibus, eligendi, omnis cumque enim asperiores quasi quidem sit. Lorem ipsum
            dolor sit amet, consectetur adipisicing elit. Possimus repellat consectetur, sed aperiam
            ex nulla repellendus tempora vero illo aliquam autem! Impedit ipsa praesentium vero
            veritatis unde eos, fuga magnam!
          </Text>
        </Field>

        <Field indentChildren={true} label="Seller">
          <>
            {showShopLink ? (
              <Link onClick={() => navigateWithSpinner(`/shop/${product.sellerId}`)}>
                {product.seller}
              </Link>
            ) : (
              <Text>{product.seller}</Text>
            )}
            <Caption1>&nbsp;&nbsp;{product.sellerClass}</Caption1>
          </>
        </Field>

        <Field indentChildren={true} label="Posted at">
          <Text>{formatDatetime(new Date())}</Text>
        </Field>

        <Field indentChildren={true} label="e-Coins">
          <div className={styles.iconText}>
            <BsCoin />
            <span>{product.cost}</span>
          </div>
        </Field>

        {showOrder ? (
          <Field indentChildren={true} label="Buyers">
            <div className={styles.iconText}>
              <HeartRegular />
              <span>{product.likes}</span>
            </div>
          </Field>
        ) : (
          <EmptyCell />
        )}

        {approvalStatus === undefined ? (
          <>
            <Field indentChildren={true} label="Rating">
              <RatingDisplay color="brand" size="medium" value={product.rating} />
            </Field>
            <EmptyCell />
          </>
        ) : (
          <></>
        )}
      </Form>
    ) : (
      <div></div>
    ),
  );

  const ProductReview = React.memo(() => (
    <div aria-labelledby="ProductReview" role="tabpanel">
      <Form numColumn={1}>
        <br />
        <div className={styles.row}>
          <div className={styles.col25}>
            <Text>Isaac Lau</Text>&nbsp;&nbsp;<Caption2>5E-20</Caption2>
          </div>
          <div className={styles.col25}>{formatDistanceToNow(new Date(2025, 2, 20, 18, 11))}</div>
          <div className={styles.col50Right}>
            <RatingDisplay color="brand" value={4.5} />
          </div>
        </div>
        <div className={styles.commentWrapper}>
          <Text block>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium accusamus voluptate
            autem? Recusandae alias corporis dicta quisquam sequi molestias deleniti, libero
            necessitatibus, eligendi, omnis cumque enim asperiores quasi quidem sit. Lorem ipsum
            dolor sit amet, consectetur adipisicing elit. Possimus repellat consectetur, sed aperiam
            ex nulla repellendus tempora vero illo aliquam autem! Impedit ipsa praesentium vero
            veritatis unde eos, fuga magnam!
          </Text>
        </div>
        <div className={styles.row}>
          <div className={styles.col25}>
            <Text>Edward Chan</Text>&nbsp;&nbsp;<Caption2>4A-7</Caption2>
          </div>
          <div className={styles.col25}>
            {formatDistanceToNow(new Date(2024, 11, 20, 14, 25, 31))}
          </div>
          <div className={styles.col50Right}>
            <RatingDisplay color="brand" value={3.8} />
          </div>
        </div>
        <div className={styles.commentWrapper}>
          <Text block>
            Pellentesque finibus quam quam, a rhoncus turpis ultrices a. Nunc at nulla dolor.
            Maecenas sit amet suscipit magna, ut viverra turpis. Nam eu sem tempor, consequat lacus
            sollicitudin, elementum nisl. Mauris nec interdum erat. Suspendisse justo nisl, dapibus
            ultricies nulla at, tincidunt luctus diam. Fusce ultricies tincidunt aliquet. Nam
            laoreet pretium augue facilisis lobortis. Aenean interdum sapien laoreet bibendum porta.
            Maecenas feugiat vel ligula ut fringilla. Maecenas ultricies nulla sed quam viverra
            semper. Donec nibh turpis, fermentum eu libero non, tincidunt elementum nunc. Donec a
            dui hendrerit, bibendum dui vitae, accumsan nibh.
          </Text>
        </div>
        <div className={styles.row}>
          <div className={styles.col25}>
            <Text>Stephanie Lam</Text>&nbsp;&nbsp;<Caption2>5A-18</Caption2>
          </div>
          <div className={styles.col25}>{formatDistanceToNow(new Date(2024, 9, 11, 1))}</div>
          <div className={styles.col50Right}>
            <RatingDisplay color="brand" value={4} />
          </div>
        </div>
        <div className={styles.commentWrapper}>
          <Text block>
            Donec dapibus vehicula nisl quis euismod. Sed volutpat sodales hendrerit. Suspendisse
            dictum magna magna, a efficitur libero eleifend ac. Vestibulum ante ipsum primis in
            faucibus orci luctus et ultrices posuere cubilia curae; Duis tempor iaculis ante, sit
            amet malesuada urna gravida vel. Mauris id elit non ligula pulvinar ultrices vitae non
            sem. Pellentesque nec libero venenatis lacus tempor sagittis. Nulla suscipit aliquam
            enim, et ultricies libero auctor eget. Mauris ex arcu, accumsan vitae varius a,
            venenatis vitae risus.
          </Text>
        </div>
      </Form>
    </div>
  ));

  const OrderHistory = React.memo(() => (
    <div aria-labelledby="OrderHistory" role="tabpanel">
      <Form
        numColumn={1}
        styles={{
          marginTop: tokens.spacingVerticalS,
          width: '690px',
        }}
      >
        <div className={styles.row} style={{ marginBottom: tokens.spacingVerticalS }}>
          <div className={styles.col25}>
            <Text>Isaac Lau</Text>&nbsp;&nbsp;<Caption2>5E-20</Caption2>
          </div>
          <div className={styles.col25}></div>
          <div className={styles.col50Right}>
            {formatDistanceToNow(new Date(2025, 2, 20, 18, 11))}
          </div>
        </div>
        <div className={styles.row} style={{ marginBottom: tokens.spacingVerticalS }}>
          <div className={styles.col25}>
            <Text>Edward Chan</Text>&nbsp;&nbsp;<Caption2>4A-7</Caption2>
          </div>
          <div className={styles.col25}></div>
          <div className={styles.col50Right}>
            {formatDistanceToNow(new Date(2024, 11, 20, 14, 25, 31))}
          </div>
        </div>
        <div className={styles.row} style={{ marginBottom: tokens.spacingVerticalS }}>
          <div className={styles.col25}>
            <Text>Stephanie Lam</Text>&nbsp;&nbsp;<Caption2>5A-18</Caption2>
          </div>
          <div className={styles.col25}></div>
          <div className={styles.col50Right}>{formatDistanceToNow(new Date(2024, 9, 11, 1))}</div>
        </div>
        <div className={styles.row} style={{ marginBottom: tokens.spacingVerticalS }}>
          <div className={styles.col25}>
            <Text>Caroline Chan</Text>&nbsp;&nbsp;<Caption2>3D-9</Caption2>
          </div>
          <div className={styles.col25}></div>
          <div className={styles.col50Right}>{formatDistanceToNow(new Date(2024, 5, 5))}</div>
        </div>
      </Form>
    </div>
  ));

  const productName = product?.name ?? '';
  const title = <PageTitle>{productName}</PageTitle>;
  return (
    <Root>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: '100%',
        }}
      >
        {approvalStatus ? (
          <div>
            {title}&nbsp;&nbsp;
            <Subtitle2 italic={true} style={{ color: tokens.colorStatusWarningForeground1 }}>
              ({approvalStatus})
            </Subtitle2>
          </div>
        ) : (
          title
        )}
        <ImageCarousel
          images={product ? [product.imageUrl, product.imageUrl, product.imageUrl] : []}
        />
        {(showReview || showOrder) && (
          <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
            <Tab icon={<AppsListDetail />} value="tab1">
              Detail
            </Tab>
            {showReview && (
              <Tab icon={<Comment />} value="tab2">
                Review
              </Tab>
            )}
            {showOrder && (
              <Tab icon={<Heart />} value="tab3">
                Buyers
              </Tab>
            )}
          </TabList>
        )}
        <div className={styles.panels}>
          {selectedValue === 'tab1' && <ProductDetail />}
          {selectedValue === 'tab2' && <ProductReview />}
          {selectedValue === 'tab3' && <OrderHistory />}
        </div>
        <ButtonPanel>
          {[backButton, ...buttons]
            .filter(Boolean)
            .map((button, index) => cloneElement(button, { key: button.key || index }))}
        </ButtonPanel>
      </div>
    </Root>
  );
};
