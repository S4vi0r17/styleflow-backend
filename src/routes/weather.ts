import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.ts';
import { getWeather } from '../services/weather.ts';
import type { AppEnv } from '../types.ts';

const query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export const weatherRoutes = new Hono<AppEnv>();

// GET /api/v1/weather?lat=&lon=
weatherRoutes.get('/', authMiddleware, zValidator('query', query), async (c) => {
  const { lat, lon } = c.req.valid('query');
  const weather = await getWeather(lat, lon);
  return c.json({ weather });
});
