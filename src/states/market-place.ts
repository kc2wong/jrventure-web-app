import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { Product } from '../__generated__/linkedup-web-api-client';
import { findProduct as findProductRepo } from '../repo/product-repo';

type MarketPlaceStateArgs = {
  result?: Product[];
  selectedResult?: Product;
};

class MarketPlaceState implements BaseState {
  result?: Product[];
  selectedResult?: Product;
  eventTime: number;

  constructor({ result, selectedResult }: MarketPlaceStateArgs) {
    this.result = result;
    this.selectedResult = selectedResult;
    this.eventTime = Date.now();
  }

  getResult = (): Product[] | undefined => {
    return this.result;
  };
}

class MarketPlaceStateInitial extends MarketPlaceState {
  constructor() {
    super({});
  }
}

class MarketPlaceStateProgress extends MarketPlaceState {
  constructor(args: MarketPlaceState) {
    super(args);
  }
}

class MarketPlaceStateSuccess extends MarketPlaceState {
  override result: Product[];

  constructor(result: Product[], selectedResult?: Product) {
    super({ result, selectedResult });
    this.result = result;
  }
}

class MarketPlaceStateFail extends MarketPlaceState {
  failure: Message;

  constructor(args: MarketPlaceState, failure: Message) {
    super(args);
    this.failure = failure;
  }
}

const marketPlaceBaseAtom = atomWithReset<MarketPlaceState>(new MarketPlaceStateInitial());

type SearchPayload = {};

type MarketPlacePayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  reset: EmptyObject;
  select: { product?: Product };
};

const searchOrRefresh = async (
  current: MarketPlaceState,
  get: <MarketPlaceState>(atom: Atom<MarketPlaceState>) => MarketPlaceState,
  set: Setter,
) => {
  set(marketPlaceBaseAtom, new MarketPlaceStateProgress(current));
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
    set(marketPlaceBaseAtom, new MarketPlaceStateFail(get(marketPlaceBaseAtom), failure));
  } else {
    set(marketPlaceBaseAtom, new MarketPlaceStateSuccess(result, undefined));
  }
};

export const marketPlaceAtom = atom<MarketPlaceState, [OneOnly<MarketPlacePayload>], Promise<void>>(
  (get) => get(marketPlaceBaseAtom),
  async (get, set, { search, refresh, reset, select }: OneOnly<MarketPlacePayload>) => {
    const current = get(marketPlaceBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set);
    } else if (refresh) {
      if (current instanceof MarketPlaceStateSuccess) {
        searchOrRefresh(current, get, set);
      }
    } else if (select) {
      if (current instanceof MarketPlaceStateSuccess) {
        set(marketPlaceBaseAtom, new MarketPlaceStateSuccess(current.result, select.product));
      }
    } else if (reset) {
      set(marketPlaceBaseAtom, RESET);
    }
  },
);

export {
  MarketPlaceStateInitial,
  MarketPlaceStateProgress,
  MarketPlaceStateSuccess,
  MarketPlaceStateFail,
};
