import { zValidator } from '@hono/zod-validator';
import type { ZodType } from 'zod';
import { ApiError } from './errors.ts';

type Target = 'json' | 'query' | 'param' | 'header' | 'form' | 'cookie';

/**
 * Igual que `zValidator`, pero si la validación falla lanza un `ApiError`
 * con todos los mensajes de Zod, en vez del volcado crudo del ZodError.
 */
export function validate<T extends ZodType>(target: Target, schema: T) {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ApiError(
        400,
        result.error.issues.map((issue) => issue.message),
      );
    }
  });
}
