import { Error } from '../models/openapi';

export const createSystemError = (error: any): Error => {
  if ('code' in error && 'message' in error) {
    return error;
  } else {
    const message = error.message ?? error.toString();
    return { code: 'UNEXPECTED_ERROR', parameter: [], message: message };
  }
};
