import { jwtDecode } from 'jwt-decode';
import { Login } from '../models/login';
import { entity2Model as menuEntity2Model } from '../mapper/menu-item-mapper';
import { Error as ErrorModel, User } from '../models/openapi';
import {
  authenticateGoogleUser,
  postUserAuthentications,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';
import { createSystemError } from './error-util';

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<Login | ErrorModel> => {
  try {
    const resp = await callRepo(() => {
      return postUserAuthentications({ body: { email, password } });
    });
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
      return authenticateGoogleUser({ body: { accessToken } });
    });
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
