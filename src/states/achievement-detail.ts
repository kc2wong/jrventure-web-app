import { atom, Getter, Setter } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import {
  AchievementStatusEnum,
  Activity,
  Student,
  AchievementCreation,
  AchievementAttachmentCreation,
} from '../models/openapi';
import { OneOnly } from '../utils/object-util';
import { EmptyObject } from '../models/common';
import { isError, Message, MessageType } from '../models/system';
import { BaseState } from './base-state';
import { getStudentByIdRepo } from '../repo/student-repo';
import { findActivityByStudentIdRepo } from '../repo/activity-repo';
import {
  findAchievementByStudentActivityIdRepo,
  createAchievementRepo,
} from '../repo/achievement-repo';
import { AchievementDetail } from '../__generated__/linkedup-web-api-client';

type ActivityWithAchievementStatus = {
  activity: Activity;
  achievementStatus: AchievementStatusEnum;
};
type AchievementDetailStateArgs = {
  studentId?: string;
  student?: Student;
  activity: ActivityWithAchievementStatus[];
  achievement?: AchievementDetail;
  updateSuccessTime?: number;
};

class AchievementDetailState implements BaseState {
  studentId?: string;
  student?: Student;
  activity: ActivityWithAchievementStatus[];
  achievement?: AchievementDetail;
  eventTime: number;

  constructor({ studentId, student, activity, achievement }: AchievementDetailStateArgs) {
    this.eventTime = Date.now();
    this.studentId = studentId;
    this.student = student;
    this.activity = activity;
    this.achievement = achievement;
  }
}

class AchievementDetailStateInitial extends AchievementDetailState {
  constructor() {
    super({ activity: [] });
  }
}

class AchievementDetailStateSearchProgress extends AchievementDetailState {
  constructor(args: AchievementDetailState) {
    super(args);
  }
}

class AchievementDetailStateSearchSuccess extends AchievementDetailState {
  constructor(args: Omit<AchievementDetailState, 'eventTime'>) {
    super(args);
  }
}

class AchievementDetailStateSearchStudentSuccess extends AchievementDetailStateSearchSuccess {
  constructor(student?: Student) {
    // reset the activity after searching for a student
    super({
      student,
      activity: [],
    });
  }
}

class AchievementDetailStateSearchActivitySuccess extends AchievementDetailStateSearchSuccess {
  constructor(
    activity: ActivityWithAchievementStatus[],
    { studentId, student }: AchievementDetailState,
  ) {
    // reset the activity after searching for a student
    super({ studentId, student, activity });
  }
}

class AchievementDetailStateSearchAchievementSuccess extends AchievementDetailStateSearchSuccess {
  override achievement: AchievementDetail;
  constructor(achievement: AchievementDetail, args: AchievementDetailState) {
    super({ ...args, achievement });
    this.achievement = achievement;
  }
}

class AchievementDetailStateUpdateSuccess extends AchievementDetailState {
  override achievement: AchievementDetail;
  result: any;
  constructor(achievement: AchievementDetail, args: AchievementDetailState) {
    super({ ...args, achievement });
    this.achievement = achievement;
  }
}

class AchievementDetailStateFail extends AchievementDetailState {
  failure: Message;

  constructor(failure: Message, args: AchievementDetailState) {
    super(args);
    this.failure = failure;
  }
}

const achievementDetailBaseAtom = atomWithReset<AchievementDetailState>(
  new AchievementDetailStateInitial(),
);

type SearchStudentPayload = OneOnly<{ studentId: string; student: Student }>;
type AchievementDetailPayload = {
  searchStudent: SearchStudentPayload;
  searchActivity: EmptyObject;
  search: { id: string };
  reset: { student?: Student };
  newAchievement: { studentId: string; activityId: string };
  create: { achievement: AchievementCreation; attachment: AchievementAttachmentCreation[] };
};

const _setProgress = (current: AchievementDetailState, set: Setter) => {
  const stateProgress = new AchievementDetailStateSearchProgress(current);
  set(achievementDetailBaseAtom, stateProgress);
  return stateProgress;
};

const _searchStudent = async (
  current: AchievementDetailState,
  get: Getter,
  set: Setter,
  payload: SearchStudentPayload,
) => {
  const { studentId, student: inStudent } = payload;
  const stateProgress = _setProgress(current, set);

  if (inStudent) {
    const nextState = new AchievementDetailStateSearchStudentSuccess({ ...inStudent });
    set(achievementDetailBaseAtom, nextState);
    return;
  }

  const result = await getStudentByIdRepo(studentId);
  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    const nextState = new AchievementDetailStateFail(failure, stateProgress);
    set(achievementDetailBaseAtom, nextState);
    return nextState;
  } else {
    const nextState = new AchievementDetailStateSearchStudentSuccess(result);
    set(achievementDetailBaseAtom, nextState);
    return;
  }
};

const _searchActivity = async (current: AchievementDetailState, set: Setter) => {
  const studentId = current.student?.id;
  if (studentId) {
    const stateProgress = _setProgress(current, set);
    const result = await findActivityByStudentIdRepo(studentId);
    if (isError(result)) {
      const failure: Message = {
        key: result.code,
        type: MessageType.Error,
        parameters: result.parameter,
      };
      const nextState = new AchievementDetailStateFail(failure, stateProgress);
      set(achievementDetailBaseAtom, nextState);
      return nextState;
    } else {
      const nextState = new AchievementDetailStateSearchActivitySuccess(
        result.map(({ achievementStatus, ...activity }) => {
          return { achievementStatus, activity: { ...activity } };
        }),
        stateProgress,
      );
      set(achievementDetailBaseAtom, nextState);
      return;
    }
  }
};

const _searchAchievement = async (
  current: AchievementDetailState,
  set: Setter,
  studentId: string,
  activityId: string,
) => {
  const stateProgress = _setProgress(current, set);
  const result = await findAchievementByStudentActivityIdRepo(studentId, activityId);
  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    const nextState = new AchievementDetailStateFail(failure, stateProgress);
    set(achievementDetailBaseAtom, nextState);
    return;
  } else {
    const nextState = new AchievementDetailStateSearchAchievementSuccess(
      { ...result, attachment: [] },
      stateProgress,
    );
    set(achievementDetailBaseAtom, nextState);
    return;
  }
};

const _createOrUpdate = async (
  current: AchievementDetailState,
  set: Setter,
  achievementCreation: AchievementCreation,
  attachment: AchievementAttachmentCreation[],
) => {
  const stateProgress = _setProgress(current, set);
  const result = await createAchievementRepo(achievementCreation, attachment);

  if (isError(result)) {
    const failure: Message = {
      key: result.code,
      type: MessageType.Error,
      parameters: result.parameter,
    };
    const nextState = new AchievementDetailStateFail(failure, stateProgress);
    set(achievementDetailBaseAtom, nextState);
    return;
  } else {
    const nextState = new AchievementDetailStateUpdateSuccess(
      { ...result, attachment: [] },
      stateProgress,
    );
    set(achievementDetailBaseAtom, nextState);
    return;
  }
};

export const achievementDetailAtom = atom<
  AchievementDetailState,
  [OneOnly<AchievementDetailPayload>],
  Promise<void>
>(
  (get) => get(achievementDetailBaseAtom),
  async (
    get,
    set,
    {
      search,
      searchStudent,
      searchActivity,
      reset,
      newAchievement,
      create,
    }: OneOnly<AchievementDetailPayload>,
  ) => {
    const current = get(achievementDetailBaseAtom);
    if (search) {
    } else if (searchStudent) {
      _searchStudent(current, get, set, searchStudent);
    } else if (searchActivity) {
      _searchActivity(current, set);
    } else if (newAchievement) {
      _searchAchievement(current, set, newAchievement.studentId, newAchievement.activityId);
    } else if (reset) {
      set(achievementDetailBaseAtom, RESET);
      const nextState = get(achievementDetailBaseAtom);
      if (reset.student) {
        _searchStudent(nextState, get, set, { student: reset.student });
      }
    } else if (create) {
      _createOrUpdate(current, set, create.achievement, create.attachment);
    }
  },
);

export {
  AchievementDetailStateInitial,
  AchievementDetailStateSearchProgress,
  AchievementDetailStateSearchSuccess,
  AchievementDetailStateSearchStudentSuccess,
  AchievementDetailStateSearchAchievementSuccess,
  AchievementDetailStateUpdateSuccess,
  AchievementDetailStateFail,
};
