export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
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

let currentSession: AuthSession | null = null;

export function setAuthSession(session: AuthSession) {
  currentSession = session;
}

export function getAuthSession() {
  return currentSession;
}

export function clearAuthSession() {
  currentSession = null;
}