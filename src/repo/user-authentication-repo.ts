import { jwtDecode } from 'jwt-decode';
import { Login } from '../models/login';
import { webApiClient } from './backend-api-client';
import { createSystemError } from './error-util';
import { Error as ErrorModel } from '../__generated__/linkedup-web-api-client/models/Error';
import { entity2Model as menuEntity2Model } from '../mapper/menu-item-mapper';
import { User } from '../models/openapi';
// import { entity2Model as userEntity2Model } from '../mapper/user-mapper';
// import { User } from '../__generated__/linkedup-web-api-client/models/User';

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<Login | ErrorModel> => {
  try {
    const resp = await webApiClient.userAuthentication.postUserAuthentications({ email, password });
    const { user } = jwtDecode<{ user: User }>(resp.token);
    const login: Login = { user, entitledStudents: [], menu: menuEntity2Model(resp.menu) };
    return login;
  } catch (error: any) {
    return createSystemError(error);
  }
};

export const googleAuthenticate = async (accessToken: string): Promise<Login | ErrorModel> => {
  try {
    const resp = await webApiClient.userAuthentication.authenticateGoogleUser({ accessToken });
    const login: Login = {
      user: resp.user,
      entitledStudents: resp.user.entitledStudent,
      menu: menuEntity2Model(resp.menu),
    };
    return login;
  } catch (error: any) {
    return createSystemError(error);
  }
};
