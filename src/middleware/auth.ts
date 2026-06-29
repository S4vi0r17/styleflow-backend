import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { env } from '../env.ts';
import { ApiError } from '../lib/errors.ts';
import type { AppEnv } from '../types.ts';

/**
 * Verifica el JWT del header `Authorization: Bearer <token>`.
 * Si es válido, expone el id del usuario en `c.get('userId')`.
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'No autorizado: falta el token');
  }

  const token = header.slice('Bearer '.length);

  let payload;
  try {
    payload = await verify(token, env.JWT_SECRET, 'HS256');
  } catch {
    throw new ApiError(401, 'No autorizado: token inválido o expirado');
  }

  c.set('userId', payload.sub as string);
  await next();
});
