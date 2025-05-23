import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { ActivityStatusEnum, Activity } from '../models/openapi';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { findActivity as findActivityRepo } from '../repo/activity-repo';

enum ActivityOrdering {
  StartDateAsc,
  StartDateDesc,
}

export type Filter = {
  categoryCode?: string;
  participantGrade?: number[];
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  status?: ActivityStatusEnum[];
};

type ActivityListStateArgs = {
  result?: Activity[];
  selectedResult?: Activity;
  isDirty: boolean;
  ordering: ActivityOrdering;
  filter: Filter;
};

class ActivityListState implements BaseState {
  result?: Activity[];
  selectedResult?: Activity;
  isDirty: boolean;
  ordering: ActivityOrdering;
  filter: Filter;
  eventTime: number;

  constructor({ result, isDirty, selectedResult, ordering, filter }: ActivityListStateArgs) {
    this.result = result;
    this.selectedResult = selectedResult;
    this.isDirty = isDirty;
    this.ordering = ordering;
    this.filter = filter;
    this.eventTime = Date.now();
  }

  getResult = (): Activity[] | undefined => {
    return this.result;
  };
}

class ActivityListStateInitial extends ActivityListState {
  constructor() {
    super({
      ordering: ActivityOrdering.StartDateAsc,
      isDirty: false,
      filter: { participantGrade: [] },
    });
  }
}

class ActivityListStateProgress extends ActivityListState {
  constructor(args: ActivityListState) {
    super(args);
  }
}

class ActivityListStateSuccess extends ActivityListState {
  override result: Activity[];
  override filter: Filter;
  override ordering: ActivityOrdering;

  constructor(
    result: Activity[],
    filter: Filter,
    isDirty: boolean,
    ordering: ActivityOrdering,
    selectedResult?: Activity,
  ) {
    super({ result, filter, isDirty, ordering, selectedResult });
    this.result = result;
    this.filter = filter;
    this.ordering = ordering;
  }
}

class ActivityListStateFail extends ActivityListState {
  failure: Message;

  constructor(args: ActivityListState, failure: Message) {
    super(args);
    this.failure = failure;
  }
}

const activityListBaseAtom = atomWithReset<ActivityListState>(new ActivityListStateInitial());

type SearchPayload = { filter: Filter };
type UpdateOrderingPayload = { filter: Filter; ordering: ActivityOrdering };

type ActivityListPayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  updateOrdering: UpdateOrderingPayload;
  markDirty: EmptyObject;
  reset: EmptyObject;
  select: { activity?: Activity };
};

const searchOrRefresh = async (
  current: ActivityListState,
  get: <ActivityListState>(atom: Atom<ActivityListState>) => ActivityListState,
  set: Setter,
  filter: Filter,
  ordering: ActivityOrdering,
) => {
  set(activityListBaseAtom, new ActivityListStateProgress(current));
  const startTime = Date.now();
  const {
    categoryCode,
    participantGrade,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    status,
  } = filter;
  const result = await findActivityRepo({
    categoryCode,
    participantGrade,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    status,
  });
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
    set(activityListBaseAtom, new ActivityListStateFail(get(activityListBaseAtom), failure));
  } else {
    set(
      activityListBaseAtom,
      new ActivityListStateSuccess(result, filter, false, ordering, undefined),
    );
  }
};

export const activityListAtom = atom<ActivityListState, [OneOnly<ActivityListPayload>], Promise<void>>(
  (get) => get(activityListBaseAtom),
  async (
    get,
    set,
    { search, refresh, updateOrdering, reset, select, markDirty }: OneOnly<ActivityListPayload>,
  ) => {
    const current = get(activityListBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set, search.filter, current.ordering);
    } else if (refresh) {
      if (current instanceof ActivityListStateSuccess) {
        searchOrRefresh(current, get, set, current.filter, current.ordering);
      }
    } else if (updateOrdering) {
      searchOrRefresh(current, get, set, current.filter, updateOrdering.ordering);
    } else if (select) {
      if (current instanceof ActivityListStateSuccess) {
        set(
          activityListBaseAtom,
          new ActivityListStateSuccess(
            current.result,
            current.filter,
            current.isDirty,
            current.ordering,
            select.activity,
          ),
        );
      }
    } else if (markDirty) {
      if (current instanceof ActivityListStateSuccess) {
        set(
          activityListBaseAtom,
          new ActivityListStateSuccess(
            current.result,
            current.filter,
            true,
            current.ordering,
            current.selectedResult,
          ),
        );
      }
    } else if (reset) {
      set(activityListBaseAtom, RESET);
    }
  },
);

export {
  ActivityListStateInitial,
  ActivityListStateProgress,
  ActivityListStateSuccess,
  ActivityListStateFail,
};
