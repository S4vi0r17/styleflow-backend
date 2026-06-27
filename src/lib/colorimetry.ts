// Reglas de combinación de colores (colorimetría) para el recomendador.
// Base para explicar la lógica en la defensa: complementarios, análogos, neutros.

const NEUTRALS = ['negro', 'blanco', 'gris', 'beige', 'crema', 'marino'];

/** ¿Es un color neutro? (combina con casi todo) */
export function isNeutral(color: string): boolean {
  return NEUTRALS.includes(color.toLowerCase());
}

/**
 * TODO (Fase 2): determinar si dos colores combinan bien.
 * Estrategia sugerida: mapear nombres a matiz (HSL), y aplicar reglas
 * (neutro + cualquiera, análogos cercanos, complementarios opuestos).
 */
export function colorsMatch(a: string, b: string): boolean {
  if (isNeutral(a) || isNeutral(b)) return true;
  // TODO: lógica real basada en la rueda de color.
  return a.toLowerCase() === b.toLowerCase();
}
