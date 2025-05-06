import { atom } from 'jotai';
import { getStudentById as getStudentByIdEntity } from '../repo/student-repo';
import { BaseState } from './base-state';
import { Student } from '../models/openapi';
import { isError, Message, MessageType } from '../models/system';
import { atomWithReset, RESET } from 'jotai/utils';
import { EmptyObject } from '../models/common';
import { OneOnly } from '../utils/object-util';
import { delay } from '../utils/date-util';

class StudentListState implements BaseState {
  result: Student[];
  eventTime: number;

  constructor(result: Student[], version: number) {
    this.result = result;
    this.eventTime = version;
  }
}

class StudentListStateInitial extends StudentListState {
  constructor(version?: number) {
    super([], version ?? 0);
  }
}

class StudentListStateProgress extends StudentListState {
  constructor(result: Student[], version: number) {
    super(result, version + 1);
  }
}

class StudentListStateSuccess extends StudentListState {
  constructor(result: Student[], version: number) {
    super(result, version + 1);
  }
}

class StudentListStateFail extends StudentListState {
  failure: Message;

  constructor(result: Student[], version: number, failure: Message) {
    super(result, version + 1);
    this.failure = failure;
  }
}

const studentListBaseAtom = atomWithReset<StudentListState>(new StudentListStateInitial());

type StudentListPayload = { search: { id: string[] }; reset: EmptyObject };

export const studentListAtom = atom<StudentListState, [OneOnly<StudentListPayload>], Promise<void>>(
  (get) => get(studentListBaseAtom),
  async (get, set, { search, reset }: OneOnly<StudentListPayload>) => {
    const current = get(studentListBaseAtom);
    if (search) {
      const stateProgress = new StudentListStateProgress([], current.eventTime);
      set(studentListBaseAtom, stateProgress);

      const startTime = Date.now();
      const result = await getStudentByIdEntity(search.id[0]);
      const endTime = Date.now();
      if (endTime - startTime < 1000) {
        await delay(1000 - (endTime - startTime));
      }
      const isFailed = isError(result);
      if (isFailed) {
        const failure: Message = {
          key: result.code,
          type: MessageType.Error,
          parameters: result.parameter,
        };
        set(
          studentListBaseAtom,
          new StudentListStateFail(stateProgress.result, stateProgress.eventTime, failure),
        );
      } else {
        set(studentListBaseAtom, new StudentListStateSuccess(result ? [result] : [], stateProgress.eventTime));
      }
    } else if (reset) {
      set(studentListBaseAtom, RESET);
    }
  },
);

export { StudentListStateProgress, StudentListStateSuccess };
