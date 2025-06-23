import { atom, Getter, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { Error, User, UserCreation } from '../models/openapi';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { undefinedToEmptyString } from '../utils/object-util';
import { delay } from '../utils/date-util';
import {
  getUserById,
  createUser as createUserRepo,
  updateUser as updateUserRepo,
} from '../repos/user-repo';

type UserDetailStateArgs = { result?: User; updateSuccessTime?: number };

class UserDetailState implements BaseState {
  result?: User;
  eventTime: number;

  constructor({ result }: UserDetailStateArgs) {
    this.eventTime = Date.now();
    this.result = result;
  }
}

class UserDetailStateInitial extends UserDetailState {
  constructor() {
    super({});
  }
}

class UserDetailStateProgress extends UserDetailState {
  constructor(args: UserDetailState) {
    super(args);
  }
}

class UserDetailStateGetSuccess extends UserDetailState {
  override result: User;

  constructor(result: User) {
    super({ result });
    this.result = result;
  }
}

class UserDetailStateUpdateSuccess extends UserDetailState {
  override result: User;

  constructor(result: User) {
    super({ result });
    this.result = result;
  }
}

class UserDetailStateFail extends UserDetailState {
  failure: Message;

  constructor(failure: Message, args: UserDetailState) {
    super(args);
    this.failure = failure;
  }
}

const userDetailBaseAtom = atomWithReset<UserDetailState>(new UserDetailStateInitial());

type UserDetailPayload = {
  search: { id: string };
  refresh: EmptyObject;
  reset: EmptyObject;
  create: UserCreation;
  update: { id: string; version: number; user: UserCreation };
};

const _setProgress = (current: UserDetailState, set: Setter) => {
  const stateProgress = new UserDetailStateProgress(current);
  set(userDetailBaseAtom, stateProgress);
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
  result: User | Error,
  set: Setter,
  currentState: UserDetailState,
  successState: (user: User) => UserDetailState,
): UserDetailState => {
  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    const nextState = new UserDetailStateFail(failure, currentState);
    set(userDetailBaseAtom, nextState);
    return nextState;
  } else {
    const { name, ...others } = result;
    const nextState = successState({
      name: undefinedToEmptyString(name) as Record<string, any>,
      ...others,
    });
    set(userDetailBaseAtom, nextState);
    return nextState;
  }
};

const _searchOrRefresh = async (current: UserDetailState, get: Getter, set: Setter, id: string) => {
  const stateProgress = _setProgress(current, set);
  const result = await _withMinDuration(getUserById(id));
  _handleResult(result, set, stateProgress, (user) => new UserDetailStateGetSuccess(user));
};

const _createOrUpdate = async (
  current: UserDetailState,
  set: Setter,
  userCreation: UserCreation,
  userIdVersion?: { id: string; version: number },
) => {
  const stateProgress = _setProgress(current, set);
  const result = await _withMinDuration(
    userIdVersion
      ? updateUserRepo(userIdVersion.id, userIdVersion.version, userCreation)
      : createUserRepo(userCreation),
  );
  const _nextState = _handleResult(
    result,
    set,
    stateProgress,
    (user) => new UserDetailStateUpdateSuccess(user),
  );
  // await delay(100);
  // _handleResult(result, set, nextState, (user) => new UserDetailStateGetSuccess(user));
};

export const userDetailAtom = atom<UserDetailState, [OneOnly<UserDetailPayload>], Promise<void>>(
  (get) => get(userDetailBaseAtom),
  async (get, set, { search, refresh, reset, create, update }: OneOnly<UserDetailPayload>) => {
    const current = get(userDetailBaseAtom);
    if (search) {
      _searchOrRefresh(current, get, set, search.id);
    } else if (refresh) {
      if (current instanceof UserDetailStateGetSuccess) {
        _searchOrRefresh(current, get, set, current.result.id);
      }
    } else if (reset) {
      set(userDetailBaseAtom, RESET);
    } else if (create) {
      _createOrUpdate(current, set, create);
    } else if (update) {
      _createOrUpdate(current, set, update.user, { id: update.id, version: update.version });
    }
  },
);

export {
  UserDetailStateInitial,
  UserDetailStateProgress,
  UserDetailStateGetSuccess,
  UserDetailStateUpdateSuccess,
  UserDetailStateFail,
};
