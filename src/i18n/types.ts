interface GeneralTranslations {
  language: {
    en: string;
    enShort: string;
    'zh-Hant': string;
    'zh-HantShort': string;
    'zh-Hans': string;
    'zh-HansShort': string;
  };
  text: {
    noResults: string;
    searchNotPerformed: string;
    searchResult: string;
    filter: string;
    edit: string;
    add: string;
    view: string;
    search: string;
    cancel: string;
    save: string;
    all: string;
    close: string;
    error: string;
    refresh: string;
    clear: string;
    back: string;
    from: string;
    to: string;
    confirmSave: string;
    confirmSaveContent: string;
  };
  audit: {
    title: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    version: string;
  };
}

interface ComponentTranslations {
  fuiTable: {
    pageSize: string;
    pageRange: string;
    paginationBar: {
      noData: string;
      next: string;
      nextN: string;
      previous: string;
      previousN: string;
    };
  };
  imageCarousell: {
    autoplay: string;
    next: string;
    previous: string;
  };
}

interface ValidationTranslations {
  required: string;
  invalidEmail: string;
  invalidClass: string;
  tooShort: string;
  tooLong: string;
  outOfRange: string;
  endDateBeforeStartDate: string;
}

interface LoginTranslations {
  title: string;
  subtitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
  signingIn: string;
  forgotPassword: string;
  loginWithGoogle: string;
}

interface ToolbarTranslations {
  // string template with {{lastLogin}}
  lastLogin: string;
}

interface SettingsTranslations {
  title: string;
  appearance: string;
  darkMode: string;
  language: string;
  student: string;
  logout: string;
  confirmLogout: string;
  confirmLogoutContent: string;
}

interface ClassTranslations {
  title: string;
  list: string;
  grade: string;
  gradePlaceholder: string;
  classNumber: string;
  classNumberPlaceholder: string;
}

interface StudentTranslations {
  title: string;
  list: string;
  id: string;
  idPlaceholder: string;
  name: string;
  namePlaceholder: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  studentNumberPlaceholder: string;
  classId: string;
  classIdPlaceholder: string;
}

interface UserTranslations {
  title: string;
  list: string;
  email: string;
  emailPlaceholder: string;
  firstName: string;
  lastName: string;
  name: string;
  namePlaceholder: string;
  role: string;
  rolePlaceholder: string;
  roleStudent: string;
  roleParent: string;
  roleTeacher: string;
  roleAdmin: string;
  status: string;
  statusPlaceholder: string;
  statusActive: string;
  statusInactive: string;
  statusSuspend: string;
  entitlement: string;
  entitlementClass: string;
  entitlementStudent: string;
  allClasses: string;
  individualClass: string;
  studentId1: string;
  studentId1Placeholder: string;
  studentId2: string;
  studentId2Placeholder: string;
  invalidStudentId: string;
  duplicateStudentId: string;
}

interface NoticeTranslations {
  title: string;
  list: string;
  id: string;
  noticeTitle: string;
  noticeTitlePlaceholder: string;
  content: string;
  contentPlaceholder: string;
  dueAt: string;
  dueAtPlaceholder: string;
  isAcknowledgementRequired: string;
  status: string;
  statusPlaceholder: string;
  statusDraft: string;
  statusNew: string;
  statusDistributing: string;
  statusDistributed: string;
  statusRecalled: string;
  targetType: string;
  targetTypePlaceholder: string;
  targetTypeGrade: string;
  targetTypeClass: string;
  forGrade: string;
  forGradePlaceholder: string;
  forClass: string;
  forClassPlaceholder: string;
  distributedAt: string;
  distributedBy: string;
  distribute: string;
  acknowledgedAt: string;
  acknowledgedBy: string;
  recall: string;
}

interface ActivityTranslations {
  title: string;
  list: string;
  description: string;
  descriptionPlaceholder: string;
  venue: string;
  venuePlaceholder: string;
  detail: string;
  detailPlaceholder: string;
  category: string;
  categoryPlaceholder: string;
  categorySports: string;
  categoryAcademic: string;
  categoryArtistic: string;
  categoryMusic: string;
  categoryService: string;
  categoryTechnology: string;
  maxNumOfParticipant: string;
  maxNumOfParticipantPlaceholder: string;
  startDate: string;
  endDate: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  statusPlaceholder: string;
  statusDraft: string;
  statusConfirmed: string;
  statusCancelled: string;
  targetType: string;
  targetTypeGrade: string;
  targetTypeClass: string;
  forGrade: string;
  forGradePlaceholder: string;
  forClass: string;
  forClassPlaceholder: string;
  withParticipation: string;
  enrolled: string;
}

interface LetterTranslations {
  title: string;
  list: string;
  noticeId: string;
  studentId: string;
  studentIdPlaceholder: string;
  letterTitle: string;
  content: string;
  createdAt: string;
  status: string;
  statusUnread: string;
  statusRead: string;
  statusAcknowledged: string;
  acknowledgedAt: string;
  acknowledgedBy: string;
  acknowledge: string;
}

interface NavigationTranslations {
  administration: string;
  studentEngagement: string;
}

interface ApiErrorTranslations {
  [code: string]: string;
}

interface ParticipationTranslations {
  title: string;
  list: string;
  enrollment: string;
  notEnrolled: string;
  enroll: string;
  withdraw: string;
  checkIn: string;
  status: string;
  statusEnrolled: string;
  statusAttended: string;
  attendedAt: string;
  confirmWithdraw: string;
  confirmWithdrawContent: string;
}

interface AppTranslations {
  general: GeneralTranslations;
  component: ComponentTranslations;
  validation: ValidationTranslations;
  login: LoginTranslations;
  navigation: NavigationTranslations;
  setting: SettingsTranslations;
  toolbar: ToolbarTranslations;
  activity: ActivityTranslations;
  class: ClassTranslations;
  letter: LetterTranslations;
  notice: NoticeTranslations;
  participation: ParticipationTranslations;
  student: StudentTranslations;
  user: UserTranslations;
  apiError: ApiErrorTranslations;
}

export type {
  GeneralTranslations,
  ComponentTranslations,
  ValidationTranslations,
  LoginTranslations,
  NavigationTranslations,
  SettingsTranslations,
  AppTranslations,
  ToolbarTranslations,
  ActivityTranslations,
  ClassTranslations,
  LetterTranslations,
  NoticeTranslations,
  ParticipationTranslations,
  StudentTranslations,
  UserTranslations,
  ApiErrorTranslations,
};
