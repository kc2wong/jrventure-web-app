import { User } from '../models/openapi';
import { registerUser as registerUserRepo } from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

export const registerUser = async (
  accessToken: string,
  studentId: string,
  studentName: string,
): Promise<User> => {
  return await callRepo(() => {
    return registerUserRepo({ body: { accessToken, studentId, studentName } });
  });
};
