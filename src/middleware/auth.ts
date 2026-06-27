import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { env } from '../env.ts';
import type { AppEnv } from '../types.ts';

/**
 * Verifica el JWT del header `Authorization: Bearer <token>`.
 * Si es válido, expone el id del usuario en `c.get('userId')`.
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado: falta el token' }, 401);
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = await verify(token, env.JWT_SECRET, 'HS256');
    c.set('userId', payload.sub as string);
    await next();
  } catch {
    return c.json({ error: 'No autorizado: token inválido o expirado' }, 401);
  }
});
