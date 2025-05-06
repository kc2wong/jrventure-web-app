import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { ApprovalStatus, ProductApproval } from '../__generated__/linkedup-web-api-client';
import { findProductApproval as findProductApprovalRepo } from '../repo/product-approval-repo';

export type Filter = {
  classNo?: string;
  studentId?: string;
  status?: ApprovalStatus[];
};

type ProductApprovalListStateArgs = {
  result?: ProductApproval[];
  selectedResult?: ProductApproval;
  filter: Filter;
};

class ProductApprovalListState implements BaseState {
  result?: ProductApproval[];
  selectedResult?: ProductApproval;
  filter: Filter;
  eventTime: number;

  constructor({ result, selectedResult, filter }: ProductApprovalListStateArgs) {
    this.result = result;
    this.selectedResult = selectedResult;
    this.filter = filter;
    this.eventTime = Date.now();
  }

  getResult = (): ProductApproval[] | undefined => {
    return this.result;
  };
}

class ProductApprovalListStateInitial extends ProductApprovalListState {
  constructor() {
    super({ filter: { status: [] } });
  }
}

class ProductApprovalListStateProgress extends ProductApprovalListState {
  constructor(args: ProductApprovalListState) {
    super(args);
  }
}

class ProductApprovalListStateSuccess extends ProductApprovalListState {
  override result: ProductApproval[];

  constructor(result: ProductApproval[], filter: Filter, selectedResult?: ProductApproval) {
    super({ result, filter, selectedResult });
    this.result = result;
  }
}

class ProductApprovalListStateFail extends ProductApprovalListState {
  failure: Message;

  constructor(args: ProductApprovalListState, filter: Filter, failure: Message) {
    const { filter: _filter, ...others } = args;
    super({ ...others, filter });
    this.failure = failure;
  }
}

const productApprovalListBaseAtom = atomWithReset<ProductApprovalListState>(
  new ProductApprovalListStateInitial(),
);

type SearchPayload = { filter: Filter };

type ProductListPayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  reset: EmptyObject;
  select: { product?: ProductApproval };
};

const searchOrRefresh = async (
  current: ProductApprovalListState,
  get: <ProductListState>(atom: Atom<ProductListState>) => ProductListState,
  set: Setter,
  filter: Filter,
) => {
  set(productApprovalListBaseAtom, new ProductApprovalListStateProgress(current));
  const startTime = Date.now();

  const result = await findProductApprovalRepo();
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
    set(
      productApprovalListBaseAtom,
      new ProductApprovalListStateFail(get(productApprovalListBaseAtom), filter, failure),
    );
  } else {
    set(
      productApprovalListBaseAtom,
      new ProductApprovalListStateSuccess(result, filter, undefined),
    );
  }
};

export const productApprovalListAtom = atom<
  ProductApprovalListState,
  [OneOnly<ProductListPayload>],
  Promise<void>
>(
  (get) => get(productApprovalListBaseAtom),
  async (get, set, { search, refresh, reset, select }: OneOnly<ProductListPayload>) => {
    const current = get(productApprovalListBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set, search.filter);
    } else if (refresh) {
      if (current instanceof ProductApprovalListStateSuccess) {
        searchOrRefresh(current, get, set, current.filter);
      }
    } else if (select) {
      if (current instanceof ProductApprovalListStateSuccess) {
        set(
          productApprovalListBaseAtom,
          new ProductApprovalListStateSuccess(current.result, current.filter, select.product),
        );
      }
    } else if (reset) {
      set(productApprovalListBaseAtom, RESET);
    }
  },
);

export {
  ProductApprovalListStateInitial,
  ProductApprovalListStateProgress,
  ProductApprovalListStateSuccess,
  ProductApprovalListStateFail,
};
