import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida. Revisa tu archivo .env');
}

const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
