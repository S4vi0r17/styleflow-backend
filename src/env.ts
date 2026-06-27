import { z } from 'zod';

// Esquema de las variables de entorno. Se valida una sola vez al arrancar:
// si falta algo obligatorio o tiene mal formato, el servidor no arranca.
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  // Obligatorias (Fase 0)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),

  // Fase 1: clasificación con Gemini + almacenamiento de fotos (MinIO/S3)
  GEMINI_API_KEY: z.string().optional(),
  S3_ENDPOINT: z.url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().default('styleflow-garments'),

  // Fase 2: quitar fondo
  REMBG_URL: z.url().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:\n');
  console.error(z.prettifyError(parsed.error));
  throw new Error('Configuración de entorno inválida. Revisa tu archivo .env');
}

export const env = parsed.data;
