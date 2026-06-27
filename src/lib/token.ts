import { sign } from 'hono/jwt';
import { env } from '../env.ts';

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

/** Genera un JWT firmado para el usuario, válido por 7 días. */
export async function createToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SEVEN_DAYS_SECONDS;
  return sign({ sub: userId, exp }, env.JWT_SECRET, 'HS256');
}
