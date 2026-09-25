import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'cityfix.auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  });

  useEffect(() => {
    if (auth.token) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthed: !!auth.token,
      isAdmin: auth.user?.role === 'admin',

      async login(email, password) {
        const data = await api.post('/auth/login', { email, password });
        setAuth({ token: data.token, user: data.user });
        return data.user;
      },
      async register(payload) {
        const data = await api.post('/auth/register', payload);
        setAuth({ token: data.token, user: data.user });
        return data.user;
      },
      logout() {
        setAuth({ token: null, user: null });
      },
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
