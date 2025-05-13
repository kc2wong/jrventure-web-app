export type UiMode = 'administrator' | 'operator';

export enum MessageType {
  Success = 'success',
  Info = 'info',
  Error = 'error',
}

export interface Message {
  key: string;
  type: MessageType;
  parameters?: string[];
  fallbackMessage?: string;
}

export interface Error {
  code: string;
  parameter?: string[];
}

export class NotFound implements Error {
  code: string;
  parameter?: string[];

  constructor(parameter?: string[]) {
    this.code = 'NotFound'; // Ensure type safety
    this.parameter = parameter;
  }
}

export const isError = (object: any): object is Error => {
  const numOfAttribute = Object.keys(object).length;
  if (numOfAttribute === 3) {
    return 'code' in object && 'parameter' in object && 'message' in object;
  } else if (numOfAttribute === 2) {
    return 'code' in object && 'parameter' in object;
  } else {
    return false;
  }
};

export const isNotFound = (error: Error): error is NotFound => {
  return error.code === 'NotFound';
};

export const systemError = (message: string): Error => {
  return { code: 'S9999', parameter: [message] };
};

export interface ModelBase {
  lastUpdateDatetime: number;
  lastUpdateBy: string;
}
