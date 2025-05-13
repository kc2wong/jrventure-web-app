import { jwtDecode } from 'jwt-decode';
import { Login } from '../models/login';
import { webApiClient } from './backend-api-client';
import { createSystemError } from './error-util';
import { Error as ErrorModel } from '../__generated__/linkedup-web-api-client/models/Error';
import { entity2Model as menuEntity2Model } from '../mapper/menu-item-mapper';
import { User } from '../models/openapi';

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<Login | ErrorModel> => {
  try {
    const resp = await webApiClient.userAuthentication.postUserAuthentications({ email, password });
    const { user } = jwtDecode<{ user: User }>(resp.token);
    const login: Login = {
      user,
      menu: menuEntity2Model(resp.menu),
      parentUser: resp.parentUser,
    };
    return login;
  } catch (error: any) {
    return createSystemError(error);
  }
};

export const googleAuthenticate = async (accessToken: string): Promise<Login | ErrorModel> => {
  try {
    const resp = await webApiClient.userAuthentication.authenticateGoogleUser({ accessToken });
    const { user } = jwtDecode<{ user: User }>(resp.token);
    const login: Login = {
      user: user,
      menu: menuEntity2Model(resp.menu),
      parentUser: resp.parentUser,
    };
    return login;
  } catch (error: any) {
    return createSystemError(error);
  }
};
