import { Error } from '../models/openapi';
import { webApiClient } from './backend-api-client';
import { createSystemError } from './error-util';
import { Student } from '../__generated__/linkedup-web-api-client';

export const findStudent = async (id: string[]): Promise<Student[] | Error> => {
  try {
    return await webApiClient.student.findStudent(id);
  } catch (error: any) {
    return createSystemError(error);
  }
};

export const getStudentById = async (id: string): Promise<Student | undefined | Error> => {
  try {
    return await webApiClient.student.getStudentById(id);
  } catch (error: any) {
    return createSystemError(error);
  }
};
