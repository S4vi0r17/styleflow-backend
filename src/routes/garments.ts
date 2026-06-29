import { Hono } from 'hono';
import { z } from 'zod';
import { and, arrayContains, desc, eq } from 'drizzle-orm';
import { db } from '../db/client.ts';
import { garments } from '../db/schema.ts';
import { validate } from '../lib/validate.ts';
import { ApiError } from '../lib/errors.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { uploadImage, getImageUrl, deleteImage } from '../services/storage.ts';
import { classifyGarment } from '../services/ai/classify.ts';
import type { AppEnv } from '../types.ts';

// Responsable: Clóset + almacenamiento + digitalización por foto (Fase 1)
// Tablas: garments | Servicios: storage.ts, ai/classify.ts
export const garmentRoutes = new Hono<AppEnv>();
garmentRoutes.use('*', authMiddleware);

const CATEGORIES = ['top', 'bottom', 'shoes', 'outerwear', 'accessory'] as const;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Esquema para confirmar/crear una prenda (tras subir y revisar la clasificación).
const createSchema = z.object({
  imageKey: z.string().min(1),
  category: z.enum(CATEGORIES),
  subcategory: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColors: z.array(z.string()).optional(),
  style: z.string().optional(),
  season: z.array(z.string()).optional(),
  material: z.string().optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
});

// En edición todo es opcional, pero la imagen no se cambia por aquí.
const updateSchema = createSchema.partial().omit({ imageKey: true });

const listQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  season: z.string().optional(),
});

const idParam = z.object({ id: z.uuid() });

type Garment = typeof garments.$inferSelect;

// Adjunta una URL firmada de la imagen. Si S3 no está configurado, devuelve null.
async function withImageUrl(g: Garment) {
  try {
    return { ...g, imageUrl: await getImageUrl(g.imageKey) };
  } catch {
    return { ...g, imageUrl: null };
  }
}

// POST /api/v1/garments/upload  (multipart: image)
// Sube la foto a MinIO y la clasifica con IA. Si la IA falla, no se bloquea
// el flujo: se devuelve la imageKey y el usuario completa los campos a mano.
garmentRoutes.post('/upload', async (c) => {
  const form = await c.req.formData();
  const file = form.get('image');

  if (!(file instanceof File)) {
    throw new ApiError(400, 'Falta el archivo "image" (multipart/form-data)');
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new ApiError(415, 'Formato no soportado. Usa JPEG, PNG o WebP');
  }
  if (file.size > MAX_BYTES) {
    throw new ApiError(413, 'La imagen supera el tamaño máximo (8 MB)');
  }

  const bytes = await file.arrayBuffer();
  const imageKey = await uploadImage(bytes, file.type);

  let classification = null;
  let classificationError: string | null = null;
  try {
    classification = await classifyGarment(bytes, file.type);
  } catch (err) {
    classificationError = err instanceof Error ? err.message : 'Error al clasificar';
  }

  return c.json({ imageKey, classification, classificationError });
});

// POST /api/v1/garments  -> confirma/crea la prenda en el clóset
garmentRoutes.post('/', validate('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  const [garment] = await db
    .insert(garments)
    .values({ userId, ...data })
    .returning();
  return c.json({ garment: await withImageUrl(garment) }, 201);
});

// GET /api/v1/garments?category=&season=
garmentRoutes.get('/', validate('query', listQuery), async (c) => {
  const userId = c.get('userId');
  const { category, season } = c.req.valid('query');

  const conditions = [eq(garments.userId, userId)];
  if (category) conditions.push(eq(garments.category, category));
  if (season) conditions.push(arrayContains(garments.season, [season]));

  const rows = await db
    .select()
    .from(garments)
    .where(and(...conditions))
    .orderBy(desc(garments.createdAt));

  const withUrls = await Promise.all(rows.map(withImageUrl));
  return c.json({ garments: withUrls });
});

// GET /api/v1/garments/:id
garmentRoutes.get('/:id', validate('param', idParam), async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.valid('param');
  const [garment] = await db
    .select()
    .from(garments)
    .where(and(eq(garments.id, id), eq(garments.userId, userId)));

  if (!garment) throw new ApiError(404, 'Prenda no encontrada');
  return c.json({ garment: await withImageUrl(garment) });
});

// PATCH /api/v1/garments/:id
garmentRoutes.patch(
  '/:id',
  validate('param', idParam),
  validate('json', updateSchema),
  async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, 'No hay campos para actualizar');
    }

    const [garment] = await db
      .update(garments)
      .set(data)
      .where(and(eq(garments.id, id), eq(garments.userId, userId)))
      .returning();

    if (!garment) throw new ApiError(404, 'Prenda no encontrada');
    return c.json({ garment: await withImageUrl(garment) });
  },
);

// DELETE /api/v1/garments/:id
garmentRoutes.delete('/:id', validate('param', idParam), async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.valid('param');

  const [deleted] = await db
    .delete(garments)
    .where(and(eq(garments.id, id), eq(garments.userId, userId)))
    .returning();

  if (!deleted) throw new ApiError(404, 'Prenda no encontrada');

  await deleteImage(deleted.imageKey); // best-effort
  return c.body(null, 204);
});
