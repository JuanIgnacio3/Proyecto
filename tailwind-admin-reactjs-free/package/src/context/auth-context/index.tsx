import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from 'src/lib/api';
import type { Usuario } from 'src/types/estudiante';

interface AuthContextValue {
  user: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (correo: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Cierre de sesion automatico tras este tiempo sin actividad del usuario.
const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    // La sesion vive en una cookie httpOnly: no hay token legible por JS, asi que
    // se consulta /auth/me directamente. Un 401 significa "no autenticado".
    try {
      const me = await api.get<Usuario>('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async (correo: string, password: string) => {
    // El backend fija la cookie httpOnly de sesion en la respuesta del login.
    await api.post('/auth/login', { username: correo, password }, { form: true });
    const me = await api.get<Usuario>('/auth/me');
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    void api.post('/auth/logout').catch(() => {});
    setUser(null);
  }, []);

  // Cierre de sesion por inactividad: reinicia el temporizador ante cualquier
  // actividad y, si se agota sin uso, cierra la sesion (RequireAuth redirige).
  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => logout(), IDLE_TIMEOUT_MS);
    };
    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];
    const options: AddEventListenerOptions = { capture: true, passive: true };
    events.forEach((event) => window.addEventListener(event, reset, options));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset, { capture: true }));
    };
  }, [user, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
