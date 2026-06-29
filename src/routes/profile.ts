import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.ts';
import { styleProfiles } from '../db/schema.ts';
import { validate } from '../lib/validate.ts';
import { ApiError } from '../lib/errors.ts';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Perfil de estilo (Fase 2)
// Tablas: styleProfiles
export const profileRoutes = new Hono<AppEnv>();
profileRoutes.use('*', authMiddleware);

// Todos los campos son opcionales: el usuario guarda lo que tenga y se
// actualiza solo lo que envía (los campos ausentes no se tocan).
const profileSchema = z.object({
  sizes: z.record(z.string(), z.string()).optional(), // ej. { top: "M", bottom: "32" }
  occasions: z.array(z.string()).optional(),
  goals: z.string().optional(),
  favoriteColors: z.array(z.string()).optional(),
  defaultLat: z.number().min(-90).max(90).optional(),
  defaultLon: z.number().min(-180).max(180).optional(),
});

// GET /api/v1/profile -> { profile }
profileRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const [profile] = await db
    .select()
    .from(styleProfiles)
    .where(eq(styleProfiles.userId, userId));

  if (!profile) throw new ApiError(404, 'Perfil no encontrado');
  return c.json({ profile });
});

// PUT /api/v1/profile { sizes?, occasions?, goals?, favoriteColors?, defaultLat?, defaultLon? } -> { profile }
profileRoutes.put('/', validate('json', profileSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, 'No hay campos para actualizar');
  }

  const [profile] = await db
    .update(styleProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(styleProfiles.userId, userId))
    .returning();

  if (!profile) throw new ApiError(404, 'Perfil no encontrado');
  return c.json({ profile });
});
