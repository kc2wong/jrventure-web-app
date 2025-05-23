import { z } from 'zod';

export const zodEmail = (options?: { maxLength?: number }) => {
  let schema = z.string().email();

  if (options?.maxLength !== undefined) {
    schema = schema.max(options.maxLength);
  }

  return schema.refine((v) => v.trim().length > 0, { message: 'zod.error.Required' });
};

export const zodOptionalEmail = (options?: { maxLength?: number }) => {
  let schema = z.string().email();

  if (options?.maxLength !== undefined) {
    schema = schema.max(options.maxLength);
  }

  return schema.optional();
};

export const zodString = (options?: { minLength?: number; maxLength?: number }) => {
  let schema = z.string();

  if (options?.minLength !== undefined) {
    schema = schema.min(options.minLength);
  }

  if (options?.maxLength !== undefined) {
    schema = schema.max(options.maxLength);
  }

  return schema.refine((v) => v.trim().length > 0, { message: 'zod.error.Required' });
};

export const zodOptionalString = (options?: { minLength?: number; maxLength?: number }) => {
  let schema = z.string();

  if (options?.minLength !== undefined) {
    schema = schema.min(options.minLength);
  }

  if (options?.maxLength !== undefined) {
    schema = schema.max(options.maxLength);
  }

  return schema.optional();
};

export const zodOptionalDate = () => {
  let schema = z.date();
  return schema.optional();
};
