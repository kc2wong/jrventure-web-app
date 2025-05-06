import { Atom, atom, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { User } from '../models/openapi';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { delay } from '../utils/date-util';
import { UserRole, UserStatus } from '../models/openapi';
import { findUser } from '../repo/user-repo';

enum UserOrdering {
  IdAsc,
  IdDesc,
  EmailAsc,
  EmailDesc,
}

export type Filter = {
  id?: string;
  email?: string;
  name?: string;
  studentId?: string;
  role?: UserRole[];
  status?: UserStatus[];
};

type UserListStateArgs = {
  result?: User[];
  selectedResult?: User;
  isDirty: boolean;
  ordering: UserOrdering;
  filter: Filter;
};

class UserListState implements BaseState {
  result?: User[];
  selectedResult?: User;
  isDirty: boolean;
  ordering: UserOrdering;
  filter: Filter;
  eventTime: number;

  constructor({ result, isDirty, selectedResult, ordering, filter }: UserListStateArgs) {
    this.result = result;
    this.selectedResult = selectedResult;
    this.isDirty = isDirty;
    this.ordering = ordering;
    this.filter = filter;
    this.eventTime = Date.now();
  }

  getResult = (): User[] | undefined => {
    return this.result;
  };
}

class UserListStateInitial extends UserListState {
  constructor() {
    super({ ordering: UserOrdering.IdAsc, isDirty: false, filter: { role: [], status: [] } });
  }
}

class UserListStateProgress extends UserListState {
  constructor(args: UserListState) {
    super(args);
  }
}

class UserListStateSuccess extends UserListState {
  override result: User[];
  override filter: Filter;
  override ordering: UserOrdering;

  constructor(
    result: User[],
    filter: Filter,
    isDirty: boolean,
    ordering: UserOrdering,
    selectedResult?: User,
  ) {
    super({ result, filter, isDirty, ordering, selectedResult });
    this.result = result;
    this.filter = filter;
    this.ordering = ordering;
  }
}

class UserListStateFail extends UserListState {
  failure: Message;

  constructor(args: UserListState, failure: Message) {
    super(args);
    this.failure = failure;
  }
}

const userListBaseAtom = atomWithReset<UserListState>(new UserListStateInitial());

type SearchPayload = { filter: Filter };
type UpdateOrderingPayload = { filter: Filter; ordering: UserOrdering };

type UserListPayload = {
  search: SearchPayload;
  refresh: EmptyObject;
  updateOrdering: UpdateOrderingPayload;
  markDirty: EmptyObject;
  reset: EmptyObject;
  select: { user?: User };
};

const searchOrRefresh = async (
  current: UserListState,
  get: <UserListState>(atom: Atom<UserListState>) => UserListState,
  set: Setter,
  filter: Filter,
  ordering: UserOrdering,
) => {
  set(userListBaseAtom, new UserListStateProgress(current));
  const startTime = Date.now();
  const { email, name, studentId, role, status } = filter;
  const result = await findUser(email, name, studentId, role, status);
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
    set(userListBaseAtom, new UserListStateFail(get(userListBaseAtom), failure));
  } else {
    set(userListBaseAtom, new UserListStateSuccess(result, filter, false, ordering, undefined));
  }
};

export const userListAtom = atom<UserListState, [OneOnly<UserListPayload>], Promise<void>>(
  (get) => get(userListBaseAtom),
  async (
    get,
    set,
    { search, refresh, updateOrdering, reset, select, markDirty }: OneOnly<UserListPayload>,
  ) => {
    const current = get(userListBaseAtom);
    if (search) {
      searchOrRefresh(current, get, set, search.filter, current.ordering);
    } else if (refresh) {
      if (current instanceof UserListStateSuccess) {
        searchOrRefresh(current, get, set, current.filter, current.ordering);
      }
    } else if (updateOrdering) {
      searchOrRefresh(current, get, set, current.filter, updateOrdering.ordering);
    } else if (select) {
      if (current instanceof UserListStateSuccess) {
        set(
          userListBaseAtom,
          new UserListStateSuccess(
            current.result,
            current.filter,
            current.isDirty,
            current.ordering,
            select.user,
          ),
        );
      }
    } else if (markDirty) {
      if (current instanceof UserListStateSuccess) {
        set(
          userListBaseAtom,
          new UserListStateSuccess(
            current.result,
            current.filter,
            true,
            current.ordering,
            current.selectedResult,
          ),
        );
      }
    } else if (reset) {
      set(userListBaseAtom, RESET);
    }
  },
);

export { UserListStateInitial, UserListStateProgress, UserListStateSuccess, UserListStateFail };
