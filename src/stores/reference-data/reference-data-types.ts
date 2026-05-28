import type { Class } from '@store/class/class-types';

export type ReferenceDataStatus = 'idle' | 'loading' | 'success' | 'error';

export type ReferenceDataState = {
  classes: Class[];
  status: ReferenceDataStatus;
};

export type ReferenceDataAction = 
  | { type: 'FETCH' }
  | { type: 'RESET' };
