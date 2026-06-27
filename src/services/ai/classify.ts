// Clasificación de prendas con Gemini 2.5 Flash (visión -> JSON).
// API key gratuita: https://aistudio.google.com  (variable GEMINI_API_KEY)
//
// Mantén esta firma estable: si más adelante cambiamos de proveedor
// (ej. Claude Haiku), solo se reescribe el cuerpo de esta función.

export interface Classification {
  category: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory';
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  style: string;
  season: string[];
  material?: string;
  confidence: number; // 0-1
}

/**
 * TODO (Fase 1): enviar la imagen a Gemini 2.5 Flash con salida estructurada
 * y mapear la respuesta a `Classification`.
 *
 * @param image bytes de la imagen (p. ej. ArrayBuffer/Uint8Array desde el upload)
 * @param mimeType ej. "image/jpeg"
 */
export async function classifyGarment(
  _image: ArrayBuffer | Uint8Array,
  _mimeType: string,
): Promise<Classification> {
  throw new Error('classifyGarment: no implementado aún (Fase 1)');
}
