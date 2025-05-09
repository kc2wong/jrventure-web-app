import * as React from 'react';
import {
  makeStyles,
} from '@fluentui/react-components';
import { Product } from '../../__generated__/linkedup-web-api-client';
import { ProductCard } from './product-card';

const useStyles = makeStyles({
  main: {
    gap: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
});

type ProductGridProps = {
  products: Product[];
  editAction: (product: Product) => (() => void) | undefined;
};
export const ProductGrid: React.FC<ProductGridProps> = ({ products, editAction }) => {
  const styles = useStyles();

  return (
    <div className={styles.main}>
      {products.map((product) => (
        <ProductCard key={product.id} editAction={editAction(product)} product={product} />
      ))}
    </div>
  );
};
