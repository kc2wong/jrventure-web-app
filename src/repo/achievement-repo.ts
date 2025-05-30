import { Error, Achievement, AchievementCreation } from '../models/openapi';
import {
  createAchievement as createAchievementApi,
  findAchievementByStudentActivityId as findAchievementByStudentActivityIdApi,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

export const findAchievementByStudentActivityIdRepo = async (
  studentId: string,
  activityId: string,
): Promise<Achievement | Error> => {
  return await callRepo(() => {
    return findAchievementByStudentActivityIdApi({ path: { id: studentId, activityId } });
  });
};

export const createAchievementRepo = async (
  args: AchievementCreation,
): Promise<Achievement | Error> => {
  return await callRepo(() => {
    return createAchievementApi({ body: args });
  });
};
