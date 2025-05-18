import * as React from 'react';
import {
  Caption1,
  Text,
  tokens,
  mergeClasses,
  Label,
  RatingDisplay,
  Avatar,
  Image,
  Caption2,
  makeStyles,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import { EditRegular, HeartRegular } from '@fluentui/react-icons';
import { BsCoin } from 'react-icons/bs';
import { Card, CardHeader, CardPreview } from '@fluentui/react-components';
import { useAtom } from 'jotai';
import { Product } from '../../__generated__/linkedup-web-api-client';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';
import { shopAtom } from '../../states/student-shop';

const useStyles = makeStyles({
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

  card: {
    width: '240px',
    '@media (max-width: 600px)': {
      width: '43vw',
    },
    maxWidth: '100%',
    height: 'fit-content',
  },

  caption: {
    color: tokens.colorNeutralForeground3,

    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: tokens.lineHeightBase300, // Approximate line height
    minHeight: `calc(${tokens.lineHeightBase300} * 2)`, // Reserve space for 2 lines
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

export const DummpProductCard: React.FC<{}> = () => {
  const styles = useStyles();
  return <div className={styles.card} />;
};

export const ProductCard: React.FC<{
  product: Product;
  onSelectedForView: (product: Product) => string;
  editAction?: () => void;
}> = ({ product, onSelectedForView: viewLink, editAction }) => {
  const [, action] = useAtom(shopAtom);
  const styles = useStyles();
  const { navigate } = useNavigationHelpers();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
      <div className={styles.flex}>
        <Avatar size={20} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: tokens.spacingHorizontalS,
          }}
        >
          <Text>{product.seller}</Text>
          <Caption2>{product.sellerClass}</Caption2>
        </div>
      </div>
      <Card
        className={styles.card}
        // onClick={() => viewAction(product)}
        onClick={() => {
          action({ select: { product } });
          setTimeout(() => {
            // navigate(`/market/${product.id}/${editAction ? 'edit' : 'view'}`, {
            //   state: product,
            // });
            navigate(viewLink(product));
          });
        }}
      >
        <CardPreview className={styles.grayBackground}>
          <Image
            alt={product.name}
            className={styles.smallRadius}
            fit="contain"
            src={product.imageUrl}
          ></Image>
        </CardPreview>

        <CardHeader
          description={<Caption1 className={styles.caption}>{product.summary}</Caption1>}
          header={<Text weight="semibold">{product.name}</Text>}
        />

        <footer className={mergeClasses(styles.flex, styles.footer)}>
          <div className={styles.flex}>
            <BsCoin fontSize={16} />
            <Label>{product.cost}</Label>
          </div>
          <div className={styles.flex}>
            <HeartRegular fontSize={16} />
            <Label>{product.likes}</Label>
          </div>
        </footer>

        <footer className={mergeClasses(styles.flex, styles.footer)}>
          {editAction ? (
            <Tooltip content={'Edit product'} relationship="label" withArrow>
              <Button
                appearance="transparent"
                aria-label="More actions"
                icon={<EditRegular />}
                onClick={(e) => {
                  e.stopPropagation();
                  editAction();
                }}
              />
            </Tooltip>
          ) : (
            <div></div>
          )}
          <RatingDisplay color="brand" size="medium" value={product.rating} />
        </footer>
      </Card>
    </div>
  );
};
