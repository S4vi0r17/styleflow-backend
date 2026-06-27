// Motor de recomendación de outfits (reglas, sin IA).
// Combina por: categoría (1 top + 1 bottom + 1 calzado [+ abrigo si hace frío]),
// colorimetría (lib/colorimetry.ts), ocasión y clima.

import type { Weather } from './weather.ts';

export interface RecommendInput {
  userId: string;
  occasion?: string;
  weather?: Weather;
  baseGarmentId?: string; // pieza central a partir de la cual combinar
}

export interface RecommendedOutfit {
  garmentIds: string[];
  reason: string; // explicación legible (útil para la defensa)
}

/**
 * TODO (Fase 2): consultar las prendas del usuario y generar combinaciones
 * válidas aplicando las reglas. Devolver varias opciones ordenadas.
 */
export async function recommendOutfits(
  _input: RecommendInput,
): Promise<RecommendedOutfit[]> {
  throw new Error('recommendOutfits: no implementado aún (Fase 2)');
}
