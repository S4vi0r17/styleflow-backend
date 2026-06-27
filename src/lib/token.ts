import { sign } from 'hono/jwt';

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definida. Revisa tu archivo .env');
  return secret;
}

/** Genera un JWT firmado para el usuario, válido por 7 días. */
export async function createToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SEVEN_DAYS_SECONDS;
  return sign({ sub: userId, exp }, getSecret(), 'HS256');
}
