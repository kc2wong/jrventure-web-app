import { Student, Error as ErrorModel } from '../models/openapi';
import {
  findStudent as findStudentRepo,
  getStudentById as getStudentByIdRepo,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

export const findStudentByIds = async (id: string[]): Promise<Student[] | ErrorModel> => {
  return await callRepo(() => {
    return findStudentRepo({ query: { id } });
  });
};

export const findStudentByClassIdStudentNumber = async (classIdStudentNumber: string): Promise<Student[] | ErrorModel> => {
  return await callRepo(() => {
    return findStudentRepo({ query: { classIdStudentNumber } });
  });
};

export const getStudentById = async (id: string): Promise<Student | undefined | ErrorModel> => {
  return await callRepo(() => {
    return getStudentByIdRepo({ path: { id } });
  });
};
