import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { registerUser, loginUser } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'collabcode_jwt';

/**
 * Decode the payload section of a JWT without verifying the signature.
 * Used only for reading non-sensitive fields (displayName, email, exp).
 */
function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Return true if the decoded token payload is still valid (not expired).
 */
function isTokenValid(decoded) {
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 > Date.now();
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // { userId, displayName, email }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True while restoring from localStorage

  const [theme, setTheme] = useState('dark');

  // Restore session and theme on mount
  useEffect(() => {
    // 1. Session restore
    const restoreSession = async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        const decoded = decodeTokenPayload(stored);
        if (isTokenValid(decoded)) {
          setToken(stored);
          setCurrentUser({
            userId: decoded.userId,
            displayName: decoded.displayName,
            email: decoded.email,
          });

          // Verify with database to ensure user still exists
          try {
            const response = await fetch('http://localhost:3001/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${stored}`,
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              const data = await response.json();
              setCurrentUser({
                userId: data.user._id,
                displayName: data.user.displayName,
                email: data.user.email,
                role: data.user.role,
              });
            } else {
              console.warn('[Auth] Stale token verified as invalid, removing session.');
              localStorage.removeItem(TOKEN_KEY);
              setToken(null);
              setCurrentUser(null);
            }
          } catch (err) {
            console.error('[Auth] Network error verifying token session:', err);
          }
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    };

    restoreSession();

    // 2. Theme restore
    const storedTheme = localStorage.getItem('collabcode_theme');
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('collabcode_theme', next);
      return next;
    });
  }, []);

  /** Persist a token + derived user state */
  const _applyAuth = useCallback(({ token: t, user }) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setCurrentUser({
      userId: user._id,
      displayName: user.displayName,
      email: user.email,
    });
  }, []);

  /** Register → automatically log in */
  const register = useCallback(
    async (displayName, email, password, bio, experience, role) => {
      const data = await registerUser({ displayName, email, password, bio, experience, role });
      _applyAuth(data);
      return data;
    },
    [_applyAuth]
  );

  /** Login with email + password */
  const login = useCallback(
    async (email, password) => {
      const data = await loginUser({ email, password });
      _applyAuth(data);
      return data;
    },
    [_applyAuth]
  );

  /** Clear local session */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  }, []);

  const value = { currentUser, token, loading, register, login, logout, theme, toggleTheme };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume AuthContext — throws if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
