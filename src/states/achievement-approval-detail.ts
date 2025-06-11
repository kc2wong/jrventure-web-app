import { atom, Setter } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import { OneOnly } from '../utils/object-util';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import {
  getAchievementByIdRepo,
  rejectAchievementRepo,
  reviewAchievementRepo,
  approveAchievementRepo,
} from '../repo/achievement-repo';
import { AchievementDetail } from '../__generated__/linkedup-web-api-client';

type AchievementApprovalDetailStateArgs = {
  achievement?: AchievementDetail;
  updateSuccessTime?: number;
};

class AchievementApprovalDetailState implements BaseState {
  achievement?: AchievementDetail;
  eventTime: number;

  constructor({ achievement }: AchievementApprovalDetailStateArgs) {
    this.eventTime = Date.now();
    this.achievement = achievement;
  }
}

class AchievementApprovalDetailStateInitial extends AchievementApprovalDetailState {
  constructor() {
    super({});
  }
}

class AchievementApprovalDetailStateProgress extends AchievementApprovalDetailState {
  constructor(args: AchievementApprovalDetailState) {
    super(args);
  }
}

class AchievementApprovalDetailStateSearchSuccess extends AchievementApprovalDetailState {
  override achievement: AchievementDetail;
  constructor(achievement: AchievementDetail, args: AchievementApprovalDetailState) {
    super({ ...args, achievement });
    this.achievement = achievement;
  }
}

class AchievementApprovalDetailStateUpdateSuccess extends AchievementApprovalDetailState {
  override achievement: AchievementDetail;
  constructor(achievement: AchievementDetail, args: AchievementApprovalDetailState) {
    super({ ...args, achievement });
    this.achievement = achievement;
  }
}

class AchievementApprovalDetailStateFail extends AchievementApprovalDetailState {
  failure: Message;

  constructor(failure: Message, args: AchievementApprovalDetailState) {
    super(args);
    this.failure = failure;
  }
}

const achievementApprovalDetailBaseAtom = atomWithReset<AchievementApprovalDetailState>(
  new AchievementApprovalDetailStateInitial(),
);

type AchievementApprovalDetailPayload = {
  search: { id: string };
  reject: { comment: string };
  review: { comment: string };
  approve: {};
};

const _setProgress = (current: AchievementApprovalDetailState, set: Setter) => {
  const stateProgress = new AchievementApprovalDetailStateProgress(current);
  set(achievementApprovalDetailBaseAtom, stateProgress);
  return stateProgress;
};

const _searchAchievement = async (
  current: AchievementApprovalDetailState,
  set: Setter,
  id: string,
) => {
  const stateProgress = _setProgress(current, set);
  const result = await getAchievementByIdRepo(id);
  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    const nextState = new AchievementApprovalDetailStateFail(failure, stateProgress);
    set(achievementApprovalDetailBaseAtom, nextState);
    return;
  } else {
    const nextState = new AchievementApprovalDetailStateSearchSuccess({ ...result }, stateProgress);
    set(achievementApprovalDetailBaseAtom, nextState);
    return;
  }
};

const _review = async (current: AchievementApprovalDetailState, set: Setter, comment: string) => {
  const stateProgress = _setProgress(current, set);
  if (current.achievement) {
    const result = await reviewAchievementRepo(current.achievement.id, comment);
    if (isError(result)) {
      const failure: Message = {
        key: result.code,
        type: MessageType.Error,
        parameters: result.parameter,
      };
      const nextState = new AchievementApprovalDetailStateFail(failure, stateProgress);
      set(achievementApprovalDetailBaseAtom, nextState);
      return;
    } else {
      const nextState = new AchievementApprovalDetailStateSearchSuccess(
        { ...result },
        stateProgress,
      );
      set(achievementApprovalDetailBaseAtom, nextState);
      return;
    }
  }
};

const _reject = async (current: AchievementApprovalDetailState, set: Setter, comment: string) => {
  const stateProgress = _setProgress(current, set);
  if (current.achievement) {
    const result = await rejectAchievementRepo(current.achievement.id, comment);
    if (isError(result)) {
      const failure: Message = {
        key: result.code,
        type: MessageType.Error,
        parameters: result.parameter,
      };
      const nextState = new AchievementApprovalDetailStateFail(failure, stateProgress);
      set(achievementApprovalDetailBaseAtom, nextState);
      return;
    } else {
      const nextState = new AchievementApprovalDetailStateUpdateSuccess(
        { ...result },
        stateProgress,
      );
      set(achievementApprovalDetailBaseAtom, nextState);
      return;
    }
  }
};

const _appprove = async (current: AchievementApprovalDetailState, set: Setter) => {
  const stateProgress = _setProgress(current, set);
  if (current.achievement) {
    const result = await approveAchievementRepo(current.achievement.id);
    if (isError(result)) {
      const failure: Message = {
        key: result.code,
        type: MessageType.Error,
        parameters: result.parameter,
      };
      const nextState = new AchievementApprovalDetailStateFail(failure, stateProgress);
      set(achievementApprovalDetailBaseAtom, nextState);
      return;
    } else {
      const nextState = new AchievementApprovalDetailStateUpdateSuccess(
        { ...result },
        stateProgress,
      );
      set(achievementApprovalDetailBaseAtom, nextState);
      return;
    }
  }
};
export const achievementApprovalDetailAtom = atom<
  AchievementApprovalDetailState,
  [OneOnly<AchievementApprovalDetailPayload>],
  Promise<void>
>(
  (get) => get(achievementApprovalDetailBaseAtom),
  async (
    get,
    set,
    { search, approve, reject, review }: OneOnly<AchievementApprovalDetailPayload>,
  ) => {
    const current = get(achievementApprovalDetailBaseAtom);
    if (search) {
      _searchAchievement(current, set, search.id);
    } else if (reject) {
      _reject(current, set, reject.comment);
    } else if (review) {
      _review(current, set, review.comment);
    } else if (approve) {
      _appprove(current, set);
    }
  },
);

export {
  AchievementApprovalDetailStateInitial,
  AchievementApprovalDetailStateProgress,
  AchievementApprovalDetailStateSearchSuccess,
  AchievementApprovalDetailStateUpdateSuccess,
  AchievementApprovalDetailStateFail,
};
