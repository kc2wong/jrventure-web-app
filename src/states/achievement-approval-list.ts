import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import {
  Achievement,
  FindAchievementApprovalResult,
} from '../__generated__/linkedup-web-api-client';
import {
  AchievementApprovalPendingSubmissionDateEnum,
  SubmissionRoleEnum,
} from '../models/openapi';
import { findAchievementApprovalRepo } from '../repo/achievement-repo';

export enum AchievementOrdering {
  SubmissionDateAsc,
  SubmissionDateDesc,
}

export type Filter = {
  activityName?: string;
  submissionDateFrom?: AchievementApprovalPendingSubmissionDateEnum;
  role?: SubmissionRoleEnum;
  offset: number;
  limit: number;
};

type AchievementApprovalListStateArgs = {
  result?: FindAchievementApprovalResult;
  selectedResult?: Achievement;
  isDirty: boolean;
  ordering: AchievementOrdering;
  filter: Filter;
};

class AchievementApprovalListState implements BaseState {
  result?: FindAchievementApprovalResult;
  selectedResult?: Achievement;
  isDirty: boolean;
  ordering: AchievementOrdering;
  filter: Filter;
  eventTime: number;

  constructor({
    result,
    isDirty,
    ordering,
    selectedResult,
    filter,
  }: AchievementApprovalListStateArgs) {
    this.result = result;
    this.selectedResult = selectedResult;
    this.isDirty = isDirty;
    this.ordering = ordering;
    this.filter = filter;
    this.eventTime = Date.now();
  }

  getResult = (): FindAchievementApprovalResult | undefined => {
    return this.result;
  };
}

class AchievementApprovalListStateInitial extends AchievementApprovalListState {
  constructor() {
    super({
      isDirty: false,
      ordering: AchievementOrdering.SubmissionDateDesc,
      filter: { offset: 0, limit: 0 },
    });
  }
}

class AchievementApprovalListStateProgress extends AchievementApprovalListState {
  constructor(args: AchievementApprovalListState) {
    super(args);
  }
}

class AchievementApprovalListStateSuccess extends AchievementApprovalListState {
  override result: FindAchievementApprovalResult;
  override filter: Filter;
  override ordering: AchievementOrdering;

  constructor(
    result: FindAchievementApprovalResult,
    filter: Filter,
    isDirty: boolean,
    ordering: AchievementOrdering,
    selectedResult?: Achievement,
  ) {
    super({ result, filter, isDirty, selectedResult, ordering });
    this.result = result;
    this.filter = filter;
    this.ordering = ordering;
  }
}

class AchievementApprovalListStateFail extends AchievementApprovalListState {
  failure: Message;

  constructor(args: AchievementApprovalListState, filter: Filter, failure: Message) {
    const { filter: _filter, ...others } = args;
    super({ ...others, filter });
    this.failure = failure;
  }
}

const achievementApprovalListBaseAtom = atomWithReset<AchievementApprovalListState>(
  new AchievementApprovalListStateInitial(),
);

type SearchPayload = { filter: Filter };
type OrderByPayload = { ordering: AchievementOrdering };
type PaginationPayload = { offSet: number };

type AchievementListPayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  pagination: PaginationPayload;
  orderBy: OrderByPayload;
  markDirty: EmptyObject;
  reset: EmptyObject;
  select: { achievement?: Achievement };
};

const searchOrRefresh = async (
  current: AchievementApprovalListState,
  get: <AchievementListState>(atom: Atom<AchievementListState>) => AchievementListState,
  set: Setter,
  filter: Filter,
  ordering: AchievementOrdering,
) => {
  set(achievementApprovalListBaseAtom, new AchievementApprovalListStateProgress(current));
  const result = await findAchievementApprovalRepo({
    ...filter,
    orderByDirection:
      ordering === AchievementOrdering.SubmissionDateAsc ? 'Ascending' : 'Descending',
  });

  const isFailed = isError(result);

  if (isFailed) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    set(
      achievementApprovalListBaseAtom,
      new AchievementApprovalListStateFail(get(achievementApprovalListBaseAtom), filter, failure),
    );
  } else {
    set(
      achievementApprovalListBaseAtom,
      new AchievementApprovalListStateSuccess(result, filter, false, ordering, undefined),
    );
  }
};

export const achievementApprovalListAtom = atom<
  AchievementApprovalListState,
  [OneOnly<AchievementListPayload>],
  Promise<void>
>(
  (get) => get(achievementApprovalListBaseAtom),

  async (
    get,
    set,
    {
      search,
      refresh,
      pagination,
      orderBy,
      reset,
      select,
      markDirty,
    }: OneOnly<AchievementListPayload>,
  ) => {
    const current = get(achievementApprovalListBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set, search.filter, current.ordering);
    } else if (refresh) {
      if (current instanceof AchievementApprovalListStateSuccess) {
        searchOrRefresh(current, get, set, current.filter, current.ordering);
      }
    } else if (pagination) {
      if (current instanceof AchievementApprovalListStateSuccess) {
        const newFilter = { ...current.filter, offset: pagination.offSet };
        searchOrRefresh(current, get, set, newFilter, current.ordering);
      }
    } else if (orderBy) {
      searchOrRefresh(current, get, set, current.filter, orderBy.ordering);
    } else if (select) {
      if (current instanceof AchievementApprovalListStateSuccess) {
        set(
          achievementApprovalListBaseAtom,
          new AchievementApprovalListStateSuccess(
            current.result,
            current.filter,
            current.isDirty,
            current.ordering,
            select.achievement,
          ),
        );
      }
    } else if (markDirty) {
      if (current instanceof AchievementApprovalListStateSuccess) {
        set(
          achievementApprovalListBaseAtom,
          new AchievementApprovalListStateSuccess(
            current.result,
            current.filter,
            true,
            current.ordering,
            current.selectedResult,
          ),
        );
      }
    } else if (reset) {
      set(achievementApprovalListBaseAtom, RESET);
    }
  },
);

export {
  AchievementApprovalListStateInitial,
  AchievementApprovalListStateProgress,
  AchievementApprovalListStateSuccess,
  AchievementApprovalListStateFail,
};
