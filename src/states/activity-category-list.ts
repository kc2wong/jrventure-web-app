import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { ActivityCategory } from '../models/openapi';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { UserRoleEnum, UserStatusEnum } from '../models/openapi';
import { listActivityCategory } from '../repo/activity-category-repo';

export type Filter = {
  id?: string;
  email?: string;
  name?: string;
  studentId?: string;
  role?: UserRoleEnum[];
  status?: UserStatusEnum[];
};

type UserListStateArgs = {
  result?: ActivityCategory[];
};

class ActivityCategoryListState implements BaseState {
  result?: ActivityCategory[];
  eventTime: number;

  constructor({ result }: UserListStateArgs) {
    this.result = result;
    this.eventTime = Date.now();
  }

  getResult = (): ActivityCategory[] | undefined => {
    return this.result;
  };
}

class ActivityCategoryListStateInitial extends ActivityCategoryListState {
  constructor() {
    super({});
  }
}

class ActivityCategoryListStateProgress extends ActivityCategoryListState {
  constructor(args: ActivityCategoryListState) {
    super(args);
  }
}

class ActivityCategoryListStateSuccess extends ActivityCategoryListState {
  override result: ActivityCategory[];

  constructor(result: ActivityCategory[]) {
    super({ result });
    this.result = result;
  }
}

class ActivityCategoryListStateFail extends ActivityCategoryListState {
  failure: Message;

  constructor(args: ActivityCategoryListState, failure: Message) {
    super(args);
    this.failure = failure;
  }
}

const activityCategoryListBaseAtom = atomWithReset<ActivityCategoryListState>(
  new ActivityCategoryListStateInitial(),
);

type ActivityCategoryListPayload = {
  refresh: EmptyObject;
  reset: EmptyObject;
};

export const activityCategoryListAtom = atom<
  ActivityCategoryListState,
  [OneOnly<ActivityCategoryListPayload>],
  Promise<void>
>(
  (get) => get(activityCategoryListBaseAtom),
  async (get, set, { refresh, reset }: OneOnly<ActivityCategoryListPayload>) => {
    const current = get(activityCategoryListBaseAtom);
    if (refresh) {
      set(activityCategoryListBaseAtom, new ActivityCategoryListStateProgress(current));
      const startTime = Date.now();
      const result = await listActivityCategory();
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
          activityCategoryListBaseAtom,
          new ActivityCategoryListStateFail(get(activityCategoryListBaseAtom), failure),
        );
      } else {
        set(activityCategoryListBaseAtom, new ActivityCategoryListStateSuccess(result));
      }
    } else if (reset) {
      set(activityCategoryListBaseAtom, RESET);
    }
  },
);

export {
  ActivityCategoryListStateInitial,
  ActivityCategoryListStateProgress,
  ActivityCategoryListStateSuccess,
  ActivityCategoryListStateFail,
};
