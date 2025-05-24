import { Activity, ActivityDetail, ActivityStatus, ActivityPayload } from '../models/openapi';
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
}: FindActivityArgs): Promise<Activity[]> => {
  return await callRepo(() => {
    return findActivityRepo({
      query: {
        categoryCode: categoryCode ? [categoryCode] : undefined,
        name,
        participantGrade,
        status,
        startDateFrom: startDateFrom ? startDateFrom.toISOString() : undefined,
        startDateTo: startDateTo ? startDateTo.toISOString() : undefined,
        endDateFrom: endDateFrom ? endDateFrom.toISOString() : undefined,
        endDateTo: endDateTo ? endDateTo.toISOString() : undefined,
      },
    });
  });
};

export const getActivityById = async (id: string): Promise<ActivityDetail> => {
  return await callRepo(() => {
    return getActivityByIdRepo({ path: { id } });
  });
};

export const createActivity = async (args: ActivityPayload): Promise<ActivityDetail> => {
  return await callRepo(() => {
    return createActivityRepo({ body: args });
  });
};

export const updateActivity = async (
  activityId: string,
  version: number,
  activity: ActivityPayload,
): Promise<ActivityDetail> => {
  return await callRepo(() => {
    return updateActivityRepo({ path: { id: activityId }, body: { ...activity, version } });
  });
};
