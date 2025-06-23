import { Student, _Error as ErrorModel } from '@webapi/types'
import { findStudent, getStudentById }  from '@webapi/sdk'
import { callRepo } from './repo-util';

export const findStudentByIdsRepo = async (id: string[]): Promise<Student[] | ErrorModel> => {
  return await callRepo(() => {
    return findStudent({ query: { id } });
  });
};

export const findStudentByClassIdStudentNumberRepo = async (classIdStudentNumber: string): Promise<Student[] | ErrorModel> => {
  return await callRepo(() => {
    return findStudent({ query: { classIdStudentNumber } });
  });
};

export const getStudentByIdRepo = async (id: string): Promise<Student | undefined | ErrorModel> => {
  return await callRepo(() => {
    return getStudentById({ path: { id } });
  });
};
