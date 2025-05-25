import { UserCreation } from '../models/openapi';
import { UserRoleEnum, UserStatusEnum, User, Error } from '../models/openapi';
import {
  findUser as findUserRepo,
  getUserbyId as getUserbyIdRepo,
  createUser as createUserRepo,
  updateUser as updateUserRepo,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

export const findUser = async (
  email?: string,
  name?: string,
  studentId?: string,
  role?: UserRoleEnum[],
  status?: UserStatusEnum[],
): Promise<User[] | Error> => {
  return await callRepo(() => {
    return findUserRepo({ query: { email, name, studentId, status, role } });
  });
};

export const getUserById = async (id: string): Promise<User | Error> => {
  return await callRepo(() => {
    return getUserbyIdRepo({ path: { id } });
  });
};

export const createUser = async (args: UserCreation): Promise<User | Error> => {
  return await callRepo(() => {
    return createUserRepo({ body: args });
  });
};

export const updateUser = async (
  userId: string,
  version: number,
  user: UserCreation,
): Promise<User | Error> => {
  return await callRepo(() => {
    return updateUserRepo({ path: { id: userId }, body: { ...user, version } });
  });
};
