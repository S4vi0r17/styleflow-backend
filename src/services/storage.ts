// Almacenamiento de fotos en MinIO (compatible con S3).
// El backend guarda la foto y en la base de datos solo se guarda la `key`.
//
// Sugerencia de implementación (Fase 1): usar el SDK de S3 incluido en Bun
// (`Bun.s3`) o `@aws-sdk/client-s3`, apuntando a S3_ENDPOINT.

/**
 * TODO (Fase 1): subir la imagen al bucket y devolver su key.
 * @returns la key con la que luego se recupera/sirve la imagen.
 */
export async function uploadImage(
  _image: ArrayBuffer | Uint8Array,
  _mimeType: string,
): Promise<string> {
  throw new Error('uploadImage: no implementado aún (Fase 1)');
}

/**
 * TODO (Fase 1): devolver una URL (firmada o pública) para mostrar la imagen.
 */
export async function getImageUrl(_key: string): Promise<string> {
  throw new Error('getImageUrl: no implementado aún (Fase 1)');
}
