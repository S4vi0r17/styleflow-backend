import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Forma única de error que devuelve la API: una lista de mensajes. */
export type ApiErrorBody = { errors: string[] };

/**
 * Error de aplicación. Se lanza con `throw` desde rutas o middleware; el
 * handler global `onError` lo convierte en `{ errors: [...] }`.
 * Acepta un mensaje suelto o varios (p. ej. los de una validación).
 */
export class ApiError extends HTTPException {
  readonly messages: string[];

  constructor(status: ContentfulStatusCode, messages: string | string[]) {
    const list = Array.isArray(messages) ? messages : [messages];
    super(status, { message: list[0] });
    this.messages = list;
  }
}
