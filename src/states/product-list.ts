import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { Product } from '../__generated__/linkedup-web-api-client';
import { findProduct as findProductRepo } from '../repo/product-repo';

type ProductListStateArgs = {
  result?: Product[];
  selectedResult?: Product;
};

class ProductListState implements BaseState {
  result?: Product[];
  selectedResult?: Product;
  eventTime: number;

  constructor({ result, selectedResult }: ProductListStateArgs) {
    this.result = result;
    this.selectedResult = selectedResult;
    this.eventTime = Date.now();
  }

  getResult = (): Product[] | undefined => {
    return this.result;
  };
}

class ProductListStateInitial extends ProductListState {
  constructor() {
    super({});
  }
}

class ProductListStateProgress extends ProductListState {
  constructor(args: ProductListState) {
    super(args);
  }
}

class ProductListStateSuccess extends ProductListState {
  override result: Product[];

  constructor(result: Product[], selectedResult?: Product) {
    super({ result, selectedResult });
    this.result = result;
  }
}

class ProductListStateFail extends ProductListState {
  failure: Message;

  constructor(args: ProductListState, failure: Message) {
    super(args);
    this.failure = failure;
  }
}

const productListBaseAtom = atomWithReset<ProductListState>(new ProductListStateInitial());

type SearchPayload = {};

type ProductListPayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  reset: EmptyObject;
  select: { product?: Product };
};

const searchOrRefresh = async (
  current: ProductListState,
  get: <ProductListState>(atom: Atom<ProductListState>) => ProductListState,
  set: Setter,
) => {
  set(productListBaseAtom, new ProductListStateProgress(current));
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
    set(productListBaseAtom, new ProductListStateFail(get(productListBaseAtom), failure));
  } else {
    set(productListBaseAtom, new ProductListStateSuccess(result, undefined));
  }
};

export const productListAtom = atom<ProductListState, [OneOnly<ProductListPayload>], Promise<void>>(
  (get) => get(productListBaseAtom),
  async (get, set, { search, refresh, reset, select }: OneOnly<ProductListPayload>) => {
    const current = get(productListBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set);
    } else if (refresh) {
      if (current instanceof ProductListStateSuccess) {
        searchOrRefresh(current, get, set);
      }
    } else if (select) {
      if (current instanceof ProductListStateSuccess) {
        set(productListBaseAtom, new ProductListStateSuccess(current.result, select.product));
      }
    } else if (reset) {
      set(productListBaseAtom, RESET);
    }
  },
);

export {
  ProductListStateInitial,
  ProductListStateProgress,
  ProductListStateSuccess,
  ProductListStateFail,
};
