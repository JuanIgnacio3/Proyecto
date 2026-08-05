// Cliente minimo para la API PUBLICA (solo lectura, sin autenticacion).
// Separado del cliente admin (`api.ts`, que adjunta el token JWT y usa el
// prefijo /api/v1). Comparte origen con la admin pero con prefijo propio.

const ADMIN_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api/v1';

const PUBLIC_API_URL = ADMIN_BASE.replace(/\/api\/v1\/?$/, '') + '/api/public/v1';

/** GET a la API publica. Lanza si la respuesta no es 2xx. */
export async function publicGet<T,>(path: string): Promise<T> {
  const res = await fetch(`${PUBLIC_API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Public API error ${res.status}`);
  }
  return (await res.json()) as T;
}
