import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Perfil de estilo (Fase 2)
// Tablas: styleProfiles
export const profileRoutes = new Hono<AppEnv>();
profileRoutes.use('*', authMiddleware);

// TODO: GET /api/v1/profile -> { profile }
profileRoutes.get('/', (c) => c.json({ error: 'No implementado aún (Fase 2)' }, 501));

// TODO: PUT /api/v1/profile { sizes, occasions, goals, favoriteColors, defaultLat, defaultLon } -> { profile }
profileRoutes.put('/', (c) => c.json({ error: 'No implementado aún (Fase 2)' }, 501));
