import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ApiError } from '../lib/errors.ts';

/** Manejador global de errores. Registrado con `app.onError`. */
export function onError(err: Error, c: Context) {
  if (err instanceof ApiError) {
    return c.json({ errors: err.messages }, err.status);
  }
  if (err instanceof HTTPException) {
    return c.json({ errors: [err.message] }, err.status);
  }
  console.error('[error]', err);
  return c.json({ errors: ['Error interno del servidor'] }, 500);
}
