import { getStudentByIdRepo } from '@repos/student-repo';
import {
  getUserById,
  createUser as createUserRepo,
  updateUser as updateUserRepo,
} from '@repos/user-repo';
import { atom, Getter, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';

import { Message, MessageType } from '@schemas/system';
import { undefinedToEmptyString } from '@utils/object-util';
import { OneOnly } from '@utils/object-util';
import { User, UserCreation, Student } from '@webapi/types';
import { isError } from 'models/system';

import { BaseState } from './base-state';
import { EmptyObject } from '../models/common';
import type { Error } from '../models/openapi';

type UserDetailStateArgs = { result?: User; updateSuccessTime?: number; student?: Student[] };

class UserDetailState implements BaseState {
  result?: User;
  student?: Student[];
  eventTime: number;

  constructor({ result, student }: UserDetailStateArgs) {
    this.eventTime = Date.now();
    this.result = result;
    this.student = student;
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

class UserDetailStateSearchStudentProgress extends UserDetailState {
  constructor(args: UserDetailState) {
    super(args);
  }
}

class UserDetailStateSearchStudentSuccess extends UserDetailState {
  constructor(student?: Student[]) {
    // reset the activity after searching for a student
    super({
      student,
    });
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
  searchStudent: { studentIds: string[] };
  refresh: EmptyObject;
  reset: EmptyObject;
  create: UserCreation;
  update: { id: string; version: number; user: UserCreation };
};

const _setProgress = (
  current: UserDetailState,
  set: Setter,
  ProgressClass: new (state: UserDetailState) => UserDetailState = UserDetailStateProgress
) => {
  const stateProgress = new ProgressClass(current);
  set(userDetailBaseAtom, stateProgress);
  return stateProgress;
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
  const result = await getUserById(id);
  _handleResult(result, set, stateProgress, (user) => new UserDetailStateGetSuccess(user));
};

const _searchStudents = async (
  current: UserDetailState,
  get: Getter,
  set: Setter,
  studentIds: string[],
) => {
  const stateProgress = _setProgress(current, set, UserDetailStateSearchStudentProgress);
  const result = await Promise.all(
    studentIds.map((id) => {
      return getStudentByIdRepo(id);
    }),
  );

  const error = result.filter((r) => isError(r))[0];
  if (error) {
    const failure: Message = {
      key: error.code,
      type: MessageType.Error,
      parameters: error.parameter,
    };
    set(userDetailBaseAtom, new UserDetailStateFail(failure, stateProgress));
  } else {
    const students = result.filter(
      (item): item is Student => item !== undefined && !(item instanceof Error),
    );
    set(userDetailBaseAtom, new UserDetailStateSearchStudentSuccess(students));
  }
};

const _createOrUpdate = async (
  current: UserDetailState,
  set: Setter,
  userCreation: UserCreation,
  userIdVersion?: { id: string; version: number },
) => {
  const stateProgress = _setProgress(current, set);
  const result = userIdVersion
    ? await updateUserRepo(userIdVersion.id, userIdVersion.version, userCreation)
    : await createUserRepo(userCreation);
  const _nextState = _handleResult(
    result,
    set,
    stateProgress,
    (user) => new UserDetailStateUpdateSuccess(user),
  );
};

export const userDetailAtom = atom<UserDetailState, [OneOnly<UserDetailPayload>], Promise<void>>(
  (get) => get(userDetailBaseAtom),
  async (
    get,
    set,
    { search, searchStudent, refresh, reset, create, update }: OneOnly<UserDetailPayload>,
  ) => {
    const current = get(userDetailBaseAtom);
    if (search) {
      _searchOrRefresh(current, get, set, search.id);
    } else if (searchStudent) {
      _searchStudents(current, get, set, searchStudent.studentIds);
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
  UserDetailStateSearchStudentProgress,
  UserDetailStateSearchStudentSuccess,
  UserDetailStateFail,
};
