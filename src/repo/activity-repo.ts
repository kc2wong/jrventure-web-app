import {
  Activity,
  ActivityDetail,
  ActivityStatus,
  ActivityPayload,
  FindActivityResult,
  Error,
  AchievementStatusEnum,
  achievementStatusToEnum,
} from '../models/openapi';
import {
  findActivity as findActivityRepo,
  findActivityByStudentId as findActivityByStudentIdApi,
  getActivityById as getActivityByIdRepo,
  createActivity as createActivityRepo,
  updateActivity as updateActivityRepo,
  FindActivityOrderByField,
  OrderByDirection,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

type FindActivityArgs = {
  categoryCode?: string;
  name?: string;
  participantGrade?: number[];
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  status?: ActivityStatus[];
  limit: number;
  offset: number;
  orderByField: FindActivityOrderByField;
  orderByDirection: OrderByDirection;
};
export const findActivity = async ({
  categoryCode,
  name,
  participantGrade,
  startDateFrom,
  startDateTo,
  endDateFrom,
  endDateTo,
  status,
  limit,
  offset,
  orderByField,
  orderByDirection,
}: FindActivityArgs): Promise<FindActivityResult | Error> => {
  return await callRepo(() => {
    const query = {
      categoryCode: categoryCode ? [categoryCode] : undefined,
      name,
      participantGrade,
      status,
      startDateFrom: startDateFrom ? startDateFrom.toISOString() : undefined,
      startDateTo: startDateTo ? startDateTo.toISOString() : undefined,
      endDateFrom: endDateFrom ? endDateFrom.toISOString() : undefined,
      endDateTo: endDateTo ? endDateTo.toISOString() : undefined,
      limit,
      offset,
      orderByField,
      orderByDirection,
    };
    return findActivityRepo({
      query,
    });
  });
};

type FindActivityByStudentIdResults = Activity & { achievementStatus: AchievementStatusEnum };
export const findActivityByStudentIdRepo = async (
  studentId: string,
): Promise<FindActivityByStudentIdResults[] | Error> => {
  const result = await callRepo(() => {
    return findActivityByStudentIdApi({ path: { id: studentId } });
  });
  if (Array.isArray(result)) {
    // success
    return result.map(({ activity, achievementStatus }) => {
      return { ...activity, achievementStatus: achievementStatusToEnum(achievementStatus!) };
    });
  } else {
    // error
    return result;
  }
};

export const getActivityById = async (id: string): Promise<ActivityDetail | Error> => {
  return await callRepo(() => {
    return getActivityByIdRepo({ path: { id } });
  });
};

export const createActivity = async (args: ActivityPayload): Promise<ActivityDetail | Error> => {
  return await callRepo(() => {
    return createActivityRepo({ body: args });
  });
};

export const updateActivity = async (
  activityId: string,
  version: number,
  activity: ActivityPayload,
): Promise<ActivityDetail | Error> => {
  return await callRepo(() => {
    return updateActivityRepo({ path: { id: activityId }, body: { ...activity, version } });
  });
};
