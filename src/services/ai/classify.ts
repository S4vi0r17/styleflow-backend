// Clasificación de prendas con Gemini 2.5 Flash (visión -> JSON).
// API key gratuita: https://aistudio.google.com  (variable GEMINI_API_KEY)
//
// Mantén esta firma estable: si más adelante cambiamos de proveedor
// (ej. Claude Haiku), solo se reescribe el cuerpo de esta función.

import { z } from 'zod';
import { env } from '../../env.ts';

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

const GEMINI_MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const CATEGORIES = ['top', 'bottom', 'shoes', 'outerwear', 'accessory'] as const;

// Esquema que le pedimos a Gemini que respete (subset de OpenAPI).
// `responseMimeType: application/json` + `responseSchema` fuerzan JSON válido.
const responseSchema = {
  type: 'OBJECT',
  properties: {
    category: { type: 'STRING', enum: [...CATEGORIES] },
    subcategory: { type: 'STRING' },
    primaryColor: { type: 'STRING' },
    secondaryColors: { type: 'ARRAY', items: { type: 'STRING' } },
    style: { type: 'STRING' },
    season: { type: 'ARRAY', items: { type: 'STRING' } },
    material: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
  },
  required: [
    'category',
    'subcategory',
    'primaryColor',
    'secondaryColors',
    'style',
    'season',
    'confidence',
  ],
  propertyOrdering: [
    'category',
    'subcategory',
    'primaryColor',
    'secondaryColors',
    'style',
    'season',
    'material',
    'confidence',
  ],
};

// Validación de la respuesta: aunque Gemini siga el esquema, no confiamos a ciegas.
const classificationSchema = z.object({
  category: z.enum(CATEGORIES),
  subcategory: z.string(),
  primaryColor: z.string(),
  secondaryColors: z.array(z.string()),
  style: z.string(),
  season: z.array(z.string()),
  material: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const PROMPT = `Eres un asistente experto en moda. Analiza la ÚNICA prenda de ropa principal en la imagen y clasifícala.
Reglas:
- "category": una de top, bottom, shoes, outerwear, accessory.
- "subcategory": tipo concreto en español (ej. "camisa", "jeans", "zapatillas").
- "primaryColor" y "secondaryColors": nombres de color en español (ej. "azul marino", "blanco").
- "style": uno de casual, formal, deportivo, elegante, urbano.
- "season": lista con una o varias de verano, invierno, primavera, otoño.
- "material": tela aproximada si es visible (ej. "algodón", "mezclilla"); omítelo si no es claro.
- "confidence": tu confianza global entre 0 y 1.`;

/**
 * Envía la imagen a Gemini 2.5 Flash con salida estructurada y la mapea a `Classification`.
 *
 * @param image bytes de la imagen (ArrayBuffer/Uint8Array desde el upload)
 * @param mimeType ej. "image/jpeg"
 */
export async function classifyGarment(
  image: ArrayBuffer | Uint8Array,
  mimeType: string,
): Promise<Classification> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('Clasificación no disponible: falta GEMINI_API_KEY');
  }

  const base64 = Buffer.from(image as ArrayBuffer).toString('base64');

  const res = await fetch(`${ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini respondió ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini no devolvió contenido clasificable');
  }

  const parsed = classificationSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error('La clasificación de Gemini no tiene el formato esperado');
  }
  return parsed.data;
}
