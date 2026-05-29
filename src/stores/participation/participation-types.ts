import type { Participation, ParticipationStatus } from '@openapi/index.schemas';
import type { ApiError } from '@store/api-error';

export type ParticipationEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type ParticipationEditState = {
  status: ParticipationEditStatus;
  data: Participation | null;
  error?: ApiError;
};

export type ParticipationEditAction =
  | { type: 'GET'; activityId: string; studentId: string }
  | { type: 'ENROLL'; activityId: string; studentId: string }
  | { type: 'WITHDRAW' }
  | { type: 'CHECK_IN' }
  | { type: 'RESET' };

export type { Participation, ParticipationStatus };
