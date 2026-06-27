import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/** Manejador global de errores. Registrado con `app.onError`. */
export function onError(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error('[error]', err);
  return c.json({ error: 'Error interno del servidor' }, 500);
}
