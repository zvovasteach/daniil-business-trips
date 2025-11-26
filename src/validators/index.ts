import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { createErrorMap } from 'zod-validation-error/v4';

z.config({
  customError: createErrorMap(),
});

export function validateData<T extends z.ZodType>(
  zodType: T,
  message: { data: unknown },
  type?: 'decode',
): z.output<T>;
export function validateData<T extends z.ZodType>(
  zodType: T,
  message: { data: z.output<T> },
  type?: 'encode',
): z.input<T>;
export function validateData<T extends z.ZodType>(
  zodType: T,
  message: { data: unknown } | { data: z.output<T> },
  type: 'encode' | 'decode' = 'decode',
): z.output<T> | z.input<T> {
  try {
    switch (type) {
      case 'encode':
        return z.encode(zodType, message.data as z.output<T>);
      case 'decode':
        return z.parse(zodType, message.data);
    }
  } catch (error) {
    const JSONSchema = z.toJSONSchema(zodType, { unrepresentable: 'any' });
    const validationError = fromError(error);
    console.error(validationError.toString());
    console.error('Received data:', message);
    console.error('Expected JSONSchema:', JSONSchema);
    throw error;
  }
}
