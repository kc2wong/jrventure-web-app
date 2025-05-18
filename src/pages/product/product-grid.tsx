import * as React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { Product } from '../../__generated__/linkedup-web-api-client';
import { DummpProductCard, ProductCard } from './product-card';

const useStyles = makeStyles({
  main: {
    gap: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    '@media (max-width: 600px)': {
      justifyContent: 'space-around',
    },
  },
});

type ProductGridProps = {
  products: Product[];
  onSelectedForView: (product: Product) => string;
  editAction: (product: Product) => (() => void) | undefined;
};
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  editAction,
  onSelectedForView,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.main}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          editAction={editAction(product)}
          onSelectedForView={onSelectedForView}
          product={product}
        />
      ))}
      {products.length % 2 === 1 ? <DummpProductCard /> : <></>}
    </div>
  );
};
