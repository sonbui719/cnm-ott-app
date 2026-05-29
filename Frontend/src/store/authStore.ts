export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
<<<<<<< HEAD
=======
  avatar?: string; // Đã thêm
>>>>>>> main
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

<<<<<<< HEAD
let currentSession: AuthSession | null = null;

export function setAuthSession(session: AuthSession) {
  currentSession = session;
}

export function getAuthSession() {
=======
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

export function setAuthSession(session: AuthSession) {
  currentSession = session;
  writeStoredSession(session);
}

export function getAuthSession() {
  if (!currentSession) currentSession = readStoredSession();
>>>>>>> main
  return currentSession;
}

export function clearAuthSession() {
  currentSession = null;
<<<<<<< HEAD
}
=======
  writeStoredSession(null);
}
>>>>>>> main
