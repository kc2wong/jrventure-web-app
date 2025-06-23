import {
  Error,
  Achievement,
  AchievementCreation,
  SubmissionRoleEnum,
  AchievementApprovalPendingSubmissionDateEnum,
} from '../models/openapi';
import {
  AchievementAttachmentCreation,
  createAchievement as createAchievementApi,
  reviewAchievement as reviewAchievementApi,
  rejectAchievement as rejectAchievementApi,
  approveAchievement as approveAchievementApi,
  FindAchievementApprovalResult,
  findAchievementByStudentActivityId as findAchievementByStudentActivityIdApi,
  getAchievementById as getAchievementByIdApi,
  findPendingAchievement as findPendingAchievementApi,
  OrderByDirection,
  AchievementDetail,
} from '../__generated__/linkedup-web-api-client';
import { callRepo } from './repo-util';

type FindAchievementArgs = {
  activityName?: string;
  role?: SubmissionRoleEnum;
  submissionDateFrom?: AchievementApprovalPendingSubmissionDateEnum;
  limit: number;
  offset: number;
  orderByDirection: OrderByDirection;
};

export const findAchievementApprovalRepo = async ({
  activityName,
  role,
  submissionDateFrom,
  limit,
  offset,
  orderByDirection,
}: FindAchievementArgs): Promise<FindAchievementApprovalResult | Error> => {
  return await callRepo(() => {
    return findPendingAchievementApi({
      query: {
        activityName,
        role,
        submissionDateFrom,
        limit,
        offset,
        orderByDirection,
      },
    });
  });
};

export const findAchievementByStudentActivityIdRepo = async (
  studentId: string,
  activityId: string,
): Promise<AchievementDetail | Error> => {
  return await callRepo(() => {
    return findAchievementByStudentActivityIdApi({ path: { id: studentId, activityId } });
  });
};

export const getAchievementByIdRepo = async (id: string): Promise<AchievementDetail | Error> => {
  return await callRepo(() => {
    return getAchievementByIdApi({ path: { id } });
  });
};

export const createAchievementRepo = async (
  args: AchievementCreation,
  attachment: AchievementAttachmentCreation[],
): Promise<Achievement | Error> => {
  return await callRepo(() => {
    return createAchievementApi({ body: { ...args, attachment } });
  });
};

export const reviewAchievementRepo = async (
  id: string,
  comment: string,
): Promise<AchievementDetail | Error> => {
  return await callRepo(() => {
    return reviewAchievementApi({ path: { id }, body: { comment } });
  });
};

export const rejectAchievementRepo = async (
  id: string,
  comment: string,
): Promise<AchievementDetail | Error> => {
  return await callRepo(() => {
    return rejectAchievementApi({ path: { id }, body: { comment } });
  });
};

export const approveAchievementRepo = async (id: string): Promise<AchievementDetail | Error> => {
  return await callRepo(() => {
    return approveAchievementApi({ path: { id } });
  });
};
