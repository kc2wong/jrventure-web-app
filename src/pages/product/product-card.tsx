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

export const ProductCard: React.FC<{
  product: Product;
  editAction?: () => void;
}> = ({ product, editAction }) => {
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
        onClick={() => {
          action({ select: { product } });
          setTimeout(() => {
            navigate(`/market/${product.id}/${editAction ? 'edit' : 'view'}`);
          });
        }}
        // selected={selected}
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
