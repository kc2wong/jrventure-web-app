import { useAtomValue } from 'jotai';
import { marketPlaceAtom } from '../../states/market-place';
import { ProductDetail } from '../product/product-detail';
import { Button } from '@fluentui/react-components';
import { HeartRegular } from '@fluentui/react-icons';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { useEffect } from 'react';

export const MarketPlaceProductDetail = () => {
  const { useAppendBreadcrumb } = useBreadcrumb();
  const state = useAtomValue(marketPlaceAtom);

  const productName = state.selectedResult ? state.selectedResult.name : undefined;
  if (productName) {
    useEffect(() => {
      useAppendBreadcrumb(productName);
    }, [productName]);
  }

  const placeOrderButton = (
    <Button key="order" appearance="primary" icon={<HeartRegular />}>
      Place Order
    </Button>
  );

  return (
    <ProductDetail
      buttons={[placeOrderButton]}
      product={state.selectedResult}
      showOrder={false}
      showReview={true}
      showShopLink={true}
    ></ProductDetail>
  );
};
