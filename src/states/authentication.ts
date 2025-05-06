import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { Login } from '../models/login';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import {
  authenticateUser,
  googleAuthenticate as googleAuthenticateRepo,
} from '../repo/user-authentication-repo';
import { delay } from '../utils/date-util';

type OptionalLogin = Login | undefined;

abstract class AuthenticationState implements BaseState {
  constructor(
    public eventTime: number,
    public login: OptionalLogin,
  ) {}
}

class AuthenticationStateInitial extends AuthenticationState {
  constructor(current?: AuthenticationState) {
    super(current ? current.eventTime + 1 : 0, undefined);
  }
}

class AuthenticationStateProgress extends AuthenticationState {
  constructor(current: AuthenticationState) {
    super(current.eventTime + 1, current.login);
  }
}

class AuthenticationStateSuccess extends AuthenticationState {
  constructor(current: AuthenticationState, login?: Login) {
    super(current.eventTime + 1, login);
  }
}

class AuthenticationStateFail extends AuthenticationState {
  constructor(
    current: AuthenticationState,
    public failure: Message,
  ) {
    super(current.eventTime + 1, current.login);
  }
}

const authenticationBaseAtom = atomWithReset<AuthenticationState>(new AuthenticationStateInitial());

type SignInPayload = { email: string; password: string };
type GoogleAuthenticatePayload = { idToken: string };
type AuthenticationPayload = {
  signIn: SignInPayload;
  googleAuthenticate: GoogleAuthenticatePayload;
  signOut: EmptyObject;
  reset: EmptyObject;
};

const handleAuthResult = async (
  result: unknown,
  current: AuthenticationState,
  set: (atom: any, value: any) => void,
) => {
  const elapsed = Date.now();
  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    set(authenticationBaseAtom, new AuthenticationStateFail(current, failure));
  } else {
    const newLogin = result as Login;
    set(authenticationBaseAtom, new AuthenticationStateSuccess(current, undefined));
    const delayMs = Math.max(0, 1000 - (Date.now() - elapsed));
    if (delayMs > 0) {
      await delay(delayMs);
    }
    set(authenticationBaseAtom, new AuthenticationStateSuccess(current, newLogin));
  }
};

export const authenticationAtom = atom<
  AuthenticationState,
  [OneOnly<AuthenticationPayload>],
  Promise<void>
>(
  (get) => get(authenticationBaseAtom),
  async (get, set, action: OneOnly<AuthenticationPayload>) => {
    const current = get(authenticationBaseAtom);

    if (action.signIn) {
      set(authenticationBaseAtom, new AuthenticationStateProgress(current));
      const result = await authenticateUser(action.signIn.email, action.signIn.password);
      await handleAuthResult(result, get(authenticationBaseAtom), set);
    }

    if (action.googleAuthenticate) {
      set(authenticationBaseAtom, new AuthenticationStateProgress(current));
      const result = await googleAuthenticateRepo(action.googleAuthenticate.idToken);
      await handleAuthResult(result, get(authenticationBaseAtom), set);
    }

    if (action.signOut) {
      if (current instanceof AuthenticationStateSuccess) {
        set(authenticationBaseAtom, new AuthenticationStateInitial(current));
      }
    }

    if (action.reset) {
      set(authenticationBaseAtom, RESET);
    }
  },
);

export {
  AuthenticationState,
  AuthenticationStateProgress,
  AuthenticationStateSuccess,
  AuthenticationStateFail,
};
