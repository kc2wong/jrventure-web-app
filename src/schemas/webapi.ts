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
