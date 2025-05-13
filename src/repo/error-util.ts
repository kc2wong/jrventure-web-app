import { Error } from '../models/openapi';

export const createSystemError = (error: any): Error => {
  if (error.body && error.body.code && error.body.message) {
    return { ...error.body };
  } else {
    const message = error.message ?? error.toString();
    return { code: 'UNEXPECTED_ERROR', message: message };
  }
};
