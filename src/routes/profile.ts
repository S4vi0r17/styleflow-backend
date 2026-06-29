import { Hono } from 'hono';
import { ApiError } from '../lib/errors.ts';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Perfil de estilo (Fase 2)
// Tablas: styleProfiles
export const profileRoutes = new Hono<AppEnv>();
profileRoutes.use('*', authMiddleware);

// TODO: GET /api/v1/profile -> { profile }
profileRoutes.get('/', () => {
  throw new ApiError(501, 'No implementado aún (Fase 2)');
});

// TODO: PUT /api/v1/profile { sizes, occasions, goals, favoriteColors, defaultLat, defaultLon } -> { profile }
profileRoutes.put('/', () => {
  throw new ApiError(501, 'No implementado aún (Fase 2)');
});
