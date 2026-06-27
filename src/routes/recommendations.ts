import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Recomendador + outfits + historial (Fase 2)
// Tablas: outfits, wearHistory | Servicios: recommender.ts, weather.ts | lib/colorimetry.ts
export const recommendationRoutes = new Hono<AppEnv>();
recommendationRoutes.use('*', authMiddleware);

// TODO: POST /api/v1/recommendations { occasion?, lat?, lon?, baseGarmentId? } -> { outfits[] }
recommendationRoutes.post('/', (c) => c.json({ error: 'No implementado aún (Fase 2)' }, 501));

// Nota: los endpoints de /outfits (listar, guardar, marcar usado, descartar)
// se montan aparte en index.ts cuando se implemente esta fase.
