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

export interface ModelBase {
  lastUpdateDatetime: number;
  lastUpdateBy: string;
}
