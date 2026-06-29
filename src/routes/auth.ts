import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.ts';
import { users, styleProfiles } from '../db/schema.ts';
import { createToken } from '../lib/token.ts';
import { validate } from '../lib/validate.ts';
import { ApiError } from '../lib/errors.ts';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

const credentials = z.object({
  email: z.email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const authRoutes = new Hono<AppEnv>();

// POST /api/v1/auth/signup
authRoutes.post('/signup', validate('json', credentials), async (c) => {
  const { email, password } = c.req.valid('json');

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new ApiError(409, 'El email ya está registrado');
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

// POST /api/v1/auth/signin
authRoutes.post('/signin', validate('json', credentials), async (c) => {
  const { email, password } = c.req.valid('json');

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new ApiError(401, 'Credenciales inválidas');
  }

  const valid = await Bun.password.verify(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Credenciales inválidas');
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

  if (!user) throw new ApiError(404, 'Usuario no encontrado');
  return c.json({ user });
});
