import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { registerUser as registerUserRepo } from '../repo/user-registration-repo';
import { User } from '../models/openapi';
import { delay } from '../utils/date-util';

type UserRegistrationStateArgs = { result?: User };

abstract class UserRegistrationState implements BaseState {
  result?: User;
  eventTime: number;

  constructor({ result }: UserRegistrationStateArgs) {
    this.eventTime = Date.now();
    this.result = result;
  }
}

class UserRegistrationStateInitial extends UserRegistrationState {
  constructor() {
    super({});
  }
}

class UserRegistrationStateProgress extends UserRegistrationState {
  constructor() {
    super({});
  }
}

class UserRegistrationStateSuccess extends UserRegistrationState {
  email: string
  constructor(email: string, result?: User) {
    super({ result });
    this.email = email;
  }
}

class UserRegistrationStateFail extends UserRegistrationState {
  failure: Message;

  constructor(failure: Message, args: UserRegistrationState) {
    super(args);
    this.failure = failure;
  }
}

const userRegistrationBaseAtom = atomWithReset<UserRegistrationState>(
  new UserRegistrationStateInitial(),
);

type SignUpPayload = { accessToken: string; studentId: string; studentName: string };

export const userRegistrationAtom = atom<UserRegistrationState, [SignUpPayload], Promise<void>>(
  (get) => get(userRegistrationBaseAtom),
  async (get, set, { accessToken, studentId, studentName }: SignUpPayload) => {
    const current = get(userRegistrationBaseAtom);

    set(userRegistrationBaseAtom, new UserRegistrationStateProgress());
    const result = await registerUserRepo(accessToken, studentId, studentName);
    if (isError(result)) {
      const failure: Message = {
        key: result.code,
        type: MessageType.Error,
        parameters: result.parameter,
        fallbackMessage: result.message,
      };
      set(userRegistrationBaseAtom, new UserRegistrationStateFail(failure, current));
    } else {
      set(userRegistrationBaseAtom, new UserRegistrationStateSuccess(result.email));
      await delay(1000);
      set(userRegistrationBaseAtom, new UserRegistrationStateSuccess(result.email, result));
    }
  },
);

export {
  UserRegistrationState,
  UserRegistrationStateProgress,
  UserRegistrationStateSuccess,
  UserRegistrationStateFail,
};
