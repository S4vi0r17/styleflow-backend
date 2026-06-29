import { Hono } from 'hono';
import { ApiError } from '../lib/errors.ts';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Recomendador + outfits + historial (Fase 2)
// Tablas: outfits, wearHistory | Servicios: recommender.ts, weather.ts | lib/colorimetry.ts
export const recommendationRoutes = new Hono<AppEnv>();
recommendationRoutes.use('*', authMiddleware);

// TODO: POST /api/v1/recommendations { occasion?, lat?, lon?, baseGarmentId? } -> { outfits[] }
recommendationRoutes.post('/', () => {
  throw new ApiError(501, 'No implementado aún (Fase 2)');
});

// Nota: los endpoints de /outfits (listar, guardar, marcar usado, descartar)
// se montan aparte en index.ts cuando se implemente esta fase.
