import { jwtDecode } from 'jwt-decode';

import {
  authenticateGoogleUser,
  postUserAuthentications,
  User,
} from '@webapi/linkedup-web-api-client';

import { createSystemError } from './error-util';
import { callRepo } from './repo-util';
import { entity2Model as menuEntity2Model } from '../mapper/menu-item-mapper';
import { Login } from '../models/login';
import { Error as ErrorModel } from '../models/openapi';
import { isError } from '../models/system';

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<Login | ErrorModel> => {
  try {
    const resp = await callRepo(() => {
      return postUserAuthentications({ body: { email, password } });
    });
    if (isError(resp)) {
      return resp;
    }
    const { user } = jwtDecode<{ user: User }>(resp.token);
    const login: Login = {
      user,
      menu: menuEntity2Model(resp.menu),
      parentUser: resp.parentUser,
    };
    return login;
  } catch (error: any) {
    return 'status' in error && 'message' in error ? error : createSystemError(error);
  }
};

export const googleAuthenticate = async (accessToken: string): Promise<Login | ErrorModel> => {
  try {
    const resp = await callRepo(() => {
      return authenticateGoogleUser({ body: { type: 'Web', token: accessToken } });
    });
    if (isError(resp)) {
      return resp;
    }
    const { user } = jwtDecode<{ user: User }>(resp.token);
    const login: Login = {
      user,
      menu: menuEntity2Model(resp.menu),
      parentUser: resp.parentUser,
    };
    return login;
  } catch (error: any) {
    return 'status' in error && 'message' in error ? error : createSystemError(error);
  }
};
