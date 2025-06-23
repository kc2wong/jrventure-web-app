import { atom } from 'jotai';
import { getStudentByIdRepo } from 'repos/student-repo';
import { BaseState } from '@states/base-state';
import { Student } from '@webapi/types';
import { isError, Message, MessageType } from '../models/system';
import { atomWithReset, RESET } from 'jotai/utils';
import { EmptyObject } from '../models/common';
import { OneOnly } from '@utils/object-util';
import { delay } from '@utils/date-util';

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
      const currentStudentIds = current.result.map(s => s.id);
      // dont search if existing students matchs id to search
      if (search.id.filter(id => !currentStudentIds.includes(id)).length === 0) {
        return;
      }

      const stateProgress = new StudentListStateProgress([], current.eventTime);
      set(studentListBaseAtom, stateProgress);

      const startTime = Date.now();
      const result = await Promise.all(search.id.map(async (id) => {
        return await getStudentByIdRepo(id);
      }));

      const endTime = Date.now();
      if (endTime - startTime < 1000) {
        await delay(1000 - (endTime - startTime));
      }

      const error = result.filter((r) => isError(r))[0];
      if (error) {
        const failure: Message = {
          key: error.code,
          type: MessageType.Error,
          parameters: error.parameter,
        };
        set(
          studentListBaseAtom,
          new StudentListStateFail(stateProgress.result, stateProgress.eventTime, failure),
        );
      } else {
        const students = result.filter(
          (item): item is Student => item !== undefined && !(item instanceof Error)
        );
        set(studentListBaseAtom, new StudentListStateSuccess(students, stateProgress.eventTime));
      }
    } else if (reset) {
      set(studentListBaseAtom, RESET);
    }
  },
);

export { StudentListStateProgress, StudentListStateSuccess };
