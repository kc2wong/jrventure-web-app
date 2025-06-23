import { ActivityCategory, Error as ErrorModel } from '../models/openapi';
import { listActivityCategory as listActivityCategoryRepo } from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

export const listActivityCategory = async (): Promise<ActivityCategory[] | ErrorModel> => {
  return await callRepo(() => {
    return listActivityCategoryRepo();
  });
};
