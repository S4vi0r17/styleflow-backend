// Almacenamiento de fotos en MinIO (compatible con S3).
// El backend guarda la foto y en la base de datos solo se guarda la `key`.
//
// Usa el cliente S3 integrado en Bun (`Bun.S3Client`), apuntando a S3_ENDPOINT.

import { S3Client } from 'bun';
import { env } from '../env.ts';

// Cliente perezoso: el servidor arranca aunque S3 no esté configurado
// (las variables son opcionales en `env.ts`). Solo falla al usarse.
let client: S3Client | null = null;

function getClient(): S3Client {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new Error(
      'Almacenamiento no configurado: define S3_ENDPOINT, S3_ACCESS_KEY y S3_SECRET_KEY',
    );
  }
  client ??= new S3Client({
    endpoint: env.S3_ENDPOINT,
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
    bucket: env.S3_BUCKET,
  });
  return client;
}

// Extensión de archivo según el tipo MIME aceptado.
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Sube la imagen al bucket y devuelve su key.
 * @returns la key con la que luego se recupera/sirve la imagen.
 */
export async function uploadImage(
  image: ArrayBuffer | Uint8Array,
  mimeType: string,
): Promise<string> {
  const ext = MIME_EXT[mimeType] ?? 'bin';
  const key = `garments/${crypto.randomUUID()}.${ext}`;
  await getClient().write(key, image, { type: mimeType });
  return key;
}

/**
 * Devuelve una URL firmada (temporal) para mostrar la imagen.
 * Válida por 1 hora; el frontend la usa directamente en un `<img src>`.
 */
export async function getImageUrl(key: string): Promise<string> {
  return getClient().presign(key, { expiresIn: 60 * 60 });
}

/** Borra la imagen del bucket. Best-effort: no lanza si falla. */
export async function deleteImage(key: string): Promise<void> {
  try {
    await getClient().delete(key);
  } catch {
    // El registro de BD ya se borró; un objeto huérfano no es crítico.
  }
}
