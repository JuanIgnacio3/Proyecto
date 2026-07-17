const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'tcu_access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Cuando es true, envia el cuerpo como form-urlencoded (para el login OAuth2). */
  form?: boolean;
  auth?: boolean;
};

async function request<T,>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, form = false, auth = true } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (form && body && typeof body === 'object') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(body as Record<string, string>).toString();
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = typeof data.detail === 'string' ? data.detail : detail;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T,>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { method: 'POST', body, ...opts }),
  put: <T,>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  del: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};
