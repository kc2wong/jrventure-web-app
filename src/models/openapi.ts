import { _Error as Error, UserCreation, SimpleUser, User } from '@webapi/';
import {
  Activity,
  ActivityDetail,
  ActivityCategory,
  ActivityStatus,
  ActivityPayload,
  AchievementSubmissionRole,
  AchievementStatus,
  FindActivityResult,
  AchievementCreation,
  AchievementAttachmentCreation,
  Achievement,
  OrderByDirection,
} from '../__generated__/linkedup-web-api-client';

import { Language, UserRole, UserStatus } from '../__generated__/linkedup-web-api-client';

import { Student } from '../__generated__/linkedup-web-api-client';
import { Shop } from '../__generated__/linkedup-web-api-client';

export enum LanguageEnum {
  English = 'English',
  TraditionalChinese = 'TraditionalChinese',
  SimplifiedChinese = 'SimplifiedChinese',
}

export enum UserRoleEnum {
  Student = 'Student',
  Parent = 'Parent',
  Teacher = 'Teacher',
  Admin = 'Admin',
  Alumni = 'Alumni',
}

export enum UserStatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspend = 'Suspend',
}

export enum ApprovalStatusEnum {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum ApprovalCommentType {
  CONVERSATION = 'Conversation',
  REJECTION = 'Rejection',
  APPROVAL = 'Approval',
}

export enum SubmissionRoleEnum {
  Teacher = 'Teacher',
  Student = 'Student',
  Both = 'Both',
}

export enum ActivityStatusEnum {
  Open = 'Open',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  Scheduled = 'Scheduled',
}

export enum AchievementStatusEnum {
  New = 'New',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Published = 'Published',
}

export enum AchievementApprovalPendingSubmissionDateEnum {
  lastSevenDays = 'lastSevenDays',
  lastFourteenDays = 'lastFourteenDays',
  lastThirtyDays = 'lastThirtyDays',
}

export const roleToEnum = (role: UserRole): UserRoleEnum => UserRoleEnum[role];
export const statusToEnum = (status: UserStatus): UserStatusEnum => UserStatusEnum[status];
export const approvalStatusToEnum = (status: ApprovalStatusEnum): ApprovalStatusEnum =>
  ApprovalStatusEnum[status];
export const languageToEnum = (language: Language): LanguageEnum => LanguageEnum[language];
export const activityStatusToEnum = (activityStatus: ActivityStatus): ActivityStatusEnum =>
  ActivityStatusEnum[activityStatus];
export const achievementStatusToEnum = (
  achievementStatus: AchievementStatus,
): AchievementStatusEnum => AchievementStatusEnum[achievementStatus];

// export type { Language, UserRole, UserStatus };
export type {
  Error,
  OrderByDirection,
  User,
  SimpleUser,
  UserCreation,
  Student,
  Shop,
  Activity,
  ActivityDetail,
  ActivityCategory,
  ActivityStatus,
  ActivityPayload,
  AchievementSubmissionRole,
  FindActivityResult,
  Achievement,
  AchievementCreation,
  AchievementAttachmentCreation
};
