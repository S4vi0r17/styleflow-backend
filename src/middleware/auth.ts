import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
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
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definida');

  try {
    const payload = await verify(token, secret, 'HS256');
    c.set('userId', payload.sub as string);
    await next();
  } catch {
    return c.json({ error: 'No autorizado: token inválido o expirado' }, 401);
  }
});
