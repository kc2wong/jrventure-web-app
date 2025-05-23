import { Activity, ActivityStatus } from '../models/openapi';
import {
  findActivity as findActivityRepo,
  getActivityById as getActivityByIdRepo,
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

export const getActivityById = async (id: string): Promise<Activity> => {
  return await callRepo(() => {
    return getActivityByIdRepo({ path: { id } });
  });
};
