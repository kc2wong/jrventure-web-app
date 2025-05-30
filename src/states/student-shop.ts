import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { Product, ProductApproval, Shop } from '../__generated__/linkedup-web-api-client';
import { findProduct as findProductRepo } from '../repo/product-repo';

type ShopStateArgs = {
  shop?: Shop;
  selectedProduct?: Product;
};

class ShopState implements BaseState {
  shop?: Shop;
  selectedProduct?: Product;
  eventTime: number;

  constructor({ shop, selectedProduct }: ShopStateArgs) {
    this.shop = shop;
    this.selectedProduct = selectedProduct;
    this.eventTime = Date.now();
  }
}

class ShopStateInitial extends ShopState {
  constructor() {
    super({});
  }
}

class ShopStateProgress extends ShopState {
  constructor(args: ShopStateArgs) {
    super(args);
  }
}

class ShopStateSuccess extends ShopState {
  override shop: Shop;

  constructor(shop: Shop, selectedProduct?: Product) {
    super({ shop, selectedProduct });
    this.shop = shop;
  }
}

class ShopStateFail extends ShopState {
  failure: Message;

  constructor(args: ShopState, failure: Message) {
    super(args);
    this.failure = failure;
  }
}

const shopStateBaseAtom = atomWithReset<ShopState>(new ShopStateInitial());

type SearchPayload = {};

type ShopPayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  reset: EmptyObject;
  select: { product?: Product };
};

const searchOrRefresh = async (
  current: ShopState,
  get: <ProductListState>(atom: Atom<ProductListState>) => ProductListState,
  set: Setter,
) => {
  set(shopStateBaseAtom, new ShopStateProgress(current));
  const startTime = Date.now();

  const result = await findProductRepo();
  const endTime = Date.now();
  if (endTime - startTime < 1000) {
    await delay(1000 - (endTime - startTime));
  }

  const isFailed = isError(result);

  if (isFailed) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    set(shopStateBaseAtom, new ShopStateFail(get(shopStateBaseAtom), failure));
  } else {
    const pendingResult: ProductApproval[] = [];
    const rejectedResult: ProductApproval[] = [];
    const shop: Shop = {
      imageUrl: 'https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/cat_avatar.jpeg',
      description: {
        English: 'Welcome to my Super Store',
      },
      student: {
        id: 'S000000571',
        classId: '4E',
        studentNumber: 1,
        name: {
          English: 'Connor Chu',
        },
      },
      approvedProducts: result,
      pendingProducts: pendingResult,
      rejectedProducts: rejectedResult,
    };
    set(shopStateBaseAtom, new ShopStateSuccess(shop, undefined));
  }
};

export const shopAtom = atom<ShopState, [OneOnly<ShopPayload>], Promise<void>>(
  (get) => get(shopStateBaseAtom),
  async (get, set, { search, refresh, reset, select }: OneOnly<ShopPayload>) => {
    const current = get(shopStateBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set);
    } else if (refresh) {
      if (current instanceof ShopStateSuccess) {
        searchOrRefresh(current, get, set);
      }
    } else if (select) {
      if (current instanceof ShopStateSuccess) {
        set(shopStateBaseAtom, new ShopStateSuccess(current.shop, select.product));
      }
    } else if (reset) {
      set(shopStateBaseAtom, RESET);
    }
  },
);

export { ShopStateInitial, ShopStateProgress, ShopStateSuccess, ShopStateFail };
