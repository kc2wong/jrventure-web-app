import { Error, UserCreation } from '../models/openapi';
import { webApiClient } from './backend-api-client';
import { createSystemError } from './error-util';
import { UserRole, UserStatus, User } from '../models/openapi';

export const findUser = async (
  email?: string,
  name?: string,
  studentId?: string,
  role?: UserRole[],
  status?: UserStatus[],
): Promise<User[] | Error> => {
  try {
    return await webApiClient.userMaintenance.findUser(email, name, undefined, undefined, studentId, status, role);
  } catch (error: any) {
    return createSystemError(error);
  }
};

export const getUserById = async (id: string): Promise<User | Error> => {
  try {
    return await webApiClient.userMaintenance.getUserbyId(id);
  } catch (error: any) {
    return createSystemError(error);
  }
};

export const createUser = async (args: UserCreation): Promise<User | Error> => {
  try {
    return await webApiClient.userMaintenance.createUser(args);
  } catch (error: any) {
    return createSystemError(error);
  }
};

export const updateUser = async (userId: string, version: number, user: UserCreation): Promise<User | Error> => {
  try {
    return await webApiClient.userMaintenance.updateUser(userId, {...user, version});
  } catch (error: any) {
    return createSystemError(error);
  }
};
