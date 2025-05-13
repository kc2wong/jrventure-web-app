import { Student } from '../__generated__/linkedup-web-api-client';
import {
  findStudent as findStudentRepo,
  getStudentById as getStudentByIdRepo,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

export const findStudent = async (id: string[]): Promise<Student[]> => {
  return await callRepo(() => {
    return findStudentRepo({ query: { id } });
  });
};

export const getStudentById = async (id: string): Promise<Student | undefined> => {
  return await callRepo(() => {
    return getStudentByIdRepo({ path: { id } });
  });
};
