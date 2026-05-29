import type { SchoolClass } from '@store/class/class-types';

export type ReferenceDataStatus = 'idle' | 'loading' | 'success' | 'error';

export type ReferenceDataState = {
  classes: SchoolClass[];
  status: ReferenceDataStatus;
};

export type ReferenceDataAction = 
  | { type: 'FETCH' }
  | { type: 'RESET' };
