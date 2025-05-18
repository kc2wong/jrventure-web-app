import { useAtomValue } from 'jotai';
import { ProductDetail } from '../product/product-detail';
import { shopAtom } from '../../states/student-shop';

export const StudentShoproductDetail = () => {
  const state = useAtomValue(shopAtom);

  return (
    <ProductDetail
      buttons={[]}
      product={state.selectedProduct}
      showOrder={true}
      showReview={true}
      showShopLink={false}
    ></ProductDetail>
  );
};
