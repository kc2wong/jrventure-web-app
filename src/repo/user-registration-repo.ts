import { webApiClient } from './backend-api-client';
import { createSystemError } from './error-util';
import { Error as ErrorModel } from '../__generated__/linkedup-web-api-client/models/Error';
import { User } from '../models/openapi';

export const registerUser = async (
  accessToken: string,
  studentId: string,
  studentName: string
): Promise<User | ErrorModel> => {
  try {
    return await webApiClient.userRegistration.registerUser({accessToken, studentId, studentName})
  } catch (error: any) {
    return createSystemError(error);
  }
};
