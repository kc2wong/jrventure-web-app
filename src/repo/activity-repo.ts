import {
  ActivityDetail,
  ActivityStatus,
  ActivityPayload,
  FindActivityResult,
  Error,
} from '../models/openapi';
import {
  findActivity as findActivityRepo,
  getActivityById as getActivityByIdRepo,
  createActivity as createActivityRepo,
  updateActivity as updateActivityRepo,
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
    };
    return findActivityRepo({
      query,
    });
  });
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
