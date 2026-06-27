import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.ts';
import { users, styleProfiles } from '../db/schema.ts';
import { createToken } from '../lib/token.ts';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

const credentials = z.object({
  email: z.email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const authRoutes = new Hono<AppEnv>();

// POST /api/v1/auth/register
authRoutes.post('/register', zValidator('json', credentials), async (c) => {
  const { email, password } = c.req.valid('json');

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return c.json({ error: 'El email ya está registrado' }, 409);
  }

  const passwordHash = await Bun.password.hash(password); // argon2id por defecto
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning({ id: users.id, email: users.email });

  // Crea el perfil de estilo vacío asociado
  await db.insert(styleProfiles).values({ userId: user.id });

  const token = await createToken(user.id);
  return c.json({ token, user }, 201);
});

// POST /api/v1/auth/login
authRoutes.post('/login', zValidator('json', credentials), async (c) => {
  const { email, password } = c.req.valid('json');

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ error: 'Credenciales inválidas' }, 401);
  }

  const valid = await Bun.password.verify(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Credenciales inválidas' }, 401);
  }

  const token = await createToken(user.id);
  return c.json({ token, user: { id: user.id, email: user.email } });
});

// GET /api/v1/auth/me
authRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const [user] = await db
    .select({ id: users.id, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return c.json({ error: 'Usuario no encontrado' }, 404);
  return c.json({ user });
});
