const USER_KEY = "streakforge_auth";
const TOKEN_KEY = "streakforge_token";

export type AuthUser = {
  id?: string;
  name?: string;
  full_name?: string;
  username: string;
  email: string;
};

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
