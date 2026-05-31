export type AuthUser = {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string; // Đã thêm
  gender?: string;
  birthday?: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  position?: string;
  department?: string;
  intro?: string;
  skills?: string[];
  socialLinks?: {
    facebook?: string;
    github?: string;
    website?: string;
  };
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = "cnm-ott-auth-session";

function readStoredSession(): AuthSession | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;

    const rawSession = window.localStorage.getItem(STORAGE_KEY);
    return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession | null) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage is optional. The in-memory session still works for the current app run.
  }
}

let currentSession: AuthSession | null = readStoredSession();

function getUserIdFromToken(token?: string) {
  if (!token) return "";
  try {
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );
    if (typeof atob !== "function") return "";
    const decoded = atob(paddedPayload);
    const parsed = JSON.parse(decoded);
    return String(parsed.id || parsed._id || "");
  } catch {
    return "";
  }
}

function normalizeSession(session: AuthSession | null): AuthSession | null {
  if (!session?.user) return session;

  const userId = String(
    session.user.id || session.user._id || getUserIdFromToken(session.token) || ""
  );

  return {
    ...session,
    user: {
      ...session.user,
      id: userId,
      _id: session.user._id || userId,
    },
  };
}

export function setAuthSession(session: AuthSession) {
  currentSession = normalizeSession(session);
  writeStoredSession(currentSession);
}

export function getAuthSession() {
  if (!currentSession) currentSession = normalizeSession(readStoredSession());
  else currentSession = normalizeSession(currentSession);
  return currentSession;
}

export function clearAuthSession() {
  currentSession = null;
  writeStoredSession(null);
}
