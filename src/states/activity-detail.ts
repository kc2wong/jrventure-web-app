import { atom, Getter, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { ActivityDetail, ActivityPayload, Error } from '../models/openapi';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { undefinedToEmptyString } from '../utils/object-util';
import { delay } from '../utils/date-util';
import {
  getActivityById as getActivityByIdRepo,
  createActivity as createActivityRepo,
  updateActivity as updateActivityRepo,
} from '../repo/activity-repo';

type ActivityDetailStateArgs = { result?: ActivityDetail; updateSuccessTime?: number };

class ActivityDetailState implements BaseState {
  result?: ActivityDetail;
  eventTime: number;

  constructor({ result }: ActivityDetailStateArgs) {
    this.eventTime = Date.now();
    this.result = result;
  }
}

class ActivityDetailStateInitial extends ActivityDetailState {
  constructor() {
    super({});
  }
}

class ActivityDetailStateProgress extends ActivityDetailState {
  constructor(args: ActivityDetailState) {
    super(args);
  }
}

class ActivityDetailStateGetSuccess extends ActivityDetailState {
  override result: ActivityDetail;

  constructor(result: ActivityDetail) {
    super({ result });
    this.result = result;
  }
}

class ActivityDetailStateUpdateSuccess extends ActivityDetailState {
  override result: ActivityDetail;

  constructor(result: ActivityDetail) {
    super({ result });
    this.result = result;
  }
}

class ActivityDetailStateFail extends ActivityDetailState {
  failure: Message;

  constructor(failure: Message, args: ActivityDetailState) {
    super(args);
    this.failure = failure;
  }
}

const activityDetailBaseAtom = atomWithReset<ActivityDetailState>(new ActivityDetailStateInitial());

type ActivityDetailPayload = {
  search: { id: string };
  refresh: EmptyObject;
  reset: EmptyObject;
  create: ActivityPayload;
  update: { id: string; version: number; activity: ActivityPayload };
};

const _setProgress = (current: ActivityDetailState, set: Setter) => {
  const stateProgress = new ActivityDetailStateProgress(current);
  set(activityDetailBaseAtom, stateProgress);
  return stateProgress;
};

const _withMinDuration = async <T>(promise: Promise<T>, minDurationMs = 1000): Promise<T> => {
  const startTime = Date.now();
  const result = await promise;
  const endTime = Date.now();
  const elapsed = endTime - startTime;
  if (elapsed < minDurationMs) {
    await delay(minDurationMs - elapsed);
  }
  return result;
};

const _handleResult = (
  result: ActivityDetail | Error,
  set: Setter,
  currentState: ActivityDetailState,
  successState: (activityDetail: ActivityDetail) => ActivityDetailState,
): ActivityDetailState => {
  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    const nextState = new ActivityDetailStateFail(failure, currentState);
    set(activityDetailBaseAtom, nextState);
    return nextState;
  } else {
    const { name, ...others } = result;
    const nextState = successState({
      name: undefinedToEmptyString(name) as Record<string, any>,
      ...others,
    });
    set(activityDetailBaseAtom, nextState);
    return nextState;
  }
};

const _searchOrRefresh = async (
  current: ActivityDetailState,
  get: Getter,
  set: Setter,
  id: string,
) => {
  const stateProgress = _setProgress(current, set);
  const result = await _withMinDuration(getActivityByIdRepo(id));
  _handleResult(result, set, stateProgress, (activity) => new ActivityDetailStateGetSuccess(activity));
};

const _createOrUpdate = async (
  current: ActivityDetailState,
  set: Setter,
  activityPayload: ActivityPayload,
  activityIdVersion?: { id: string; version: number },
) => {
  const stateProgress = _setProgress(current, set);
  const result = await _withMinDuration(
    activityIdVersion
      ? updateActivityRepo(activityIdVersion.id, activityIdVersion.version, activityPayload)
      : createActivityRepo(activityPayload),
  );
  _handleResult(
    result,
    set,
    stateProgress,
    (activity) => new ActivityDetailStateUpdateSuccess(activity),
  );
};

export const activityDetailAtom = atom<
  ActivityDetailState,
  [OneOnly<ActivityDetailPayload>],
  Promise<void>
>(
  (get) => get(activityDetailBaseAtom),
  async (get, set, { search, refresh, create, update, reset }: OneOnly<ActivityDetailPayload>) => {
    const current = get(activityDetailBaseAtom);
    if (search) {
      _searchOrRefresh(current, get, set, search.id);
    } else if (refresh) {
      if (current instanceof ActivityDetailStateGetSuccess) {
        _searchOrRefresh(current, get, set, current.result.id);
      }
    } else if (reset) {
      set(activityDetailBaseAtom, RESET);
    } else if (create) {
      _createOrUpdate(current, set, create);
    } else if (update) {
      _createOrUpdate(current, set, update.activity, { id: update.id, version: update.version });
    }
  },
);

export {
  ActivityDetailStateInitial,
  ActivityDetailStateProgress,
  ActivityDetailStateGetSuccess,
  ActivityDetailStateUpdateSuccess,
  ActivityDetailStateFail,
};
