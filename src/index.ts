import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { env } from './env.ts';
import { onError } from './middleware/error.ts';
import { authRoutes } from './routes/auth.ts';
import { profileRoutes } from './routes/profile.ts';
import { garmentRoutes } from './routes/garments.ts';
import { weatherRoutes } from './routes/weather.ts';
import { recommendationRoutes } from './routes/recommendations.ts';
import type { AppEnv } from './types.ts';

const app = new Hono<AppEnv>();

app.use('*', logger());
app.onError(onError);

// Healthcheck
app.get('/', (c) =>
  c.json({ name: 'StyleFlow AI API', version: 'v1', status: 'ok' }),
);

// API v1
const api = new Hono<AppEnv>();
api.route('/auth', authRoutes);
api.route('/profile', profileRoutes);
api.route('/garments', garmentRoutes);
api.route('/weather', weatherRoutes);
api.route('/recommendations', recommendationRoutes);

app.route('/api/v1', api);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
