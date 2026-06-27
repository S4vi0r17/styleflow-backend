import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Clóset + almacenamiento + digitalización por foto (Fase 1)
// Tablas: garments | Servicios: storage.ts, ai/classify.ts
export const garmentRoutes = new Hono<AppEnv>();
garmentRoutes.use('*', authMiddleware);

// TODO: GET /api/v1/garments?category=&season= -> { garments[] }
garmentRoutes.get('/', (c) => c.json({ error: 'No implementado aún (Fase 1)' }, 501));

// TODO: POST /api/v1/garments/upload (multipart: image)
//   -> sube a MinIO (storage.uploadImage) + clasifica (classifyGarment) -> { imageKey, classification }
garmentRoutes.post('/upload', (c) => c.json({ error: 'No implementado aún (Fase 1)' }, 501));

// TODO: POST /api/v1/garments { imageKey, category, ... } -> { garment }  (confirma/edita la prenda)
garmentRoutes.post('/', (c) => c.json({ error: 'No implementado aún (Fase 1)' }, 501));

// TODO: GET /api/v1/garments/:id -> { garment }
garmentRoutes.get('/:id', (c) => c.json({ error: 'No implementado aún (Fase 1)' }, 501));

// TODO: PATCH /api/v1/garments/:id { ...campos } -> { garment }
garmentRoutes.patch('/:id', (c) => c.json({ error: 'No implementado aún (Fase 1)' }, 501));

// TODO: DELETE /api/v1/garments/:id -> 204
garmentRoutes.delete('/:id', (c) => c.json({ error: 'No implementado aún (Fase 1)' }, 501));
