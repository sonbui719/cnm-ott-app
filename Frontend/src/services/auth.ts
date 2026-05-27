import { API_BASE_URL } from "../config/api";
import type { AuthSession } from "../store/authStore";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data?.message || "Có lỗi xảy ra",
      response.status,
      data
    );
  }

  return data as T;
}

export function sendOtp(phone: string) {
  return request<{ message: string; phone: string; requestId: string }>(
    "/auth/send-otp",
    {
      method: "POST",
      body: JSON.stringify({ phone }),
    }
  );
}

export function verifyOtp(phone: string, code: string) {
  return request<{ message: string; phone: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export function login(identifier: string, password: string) {
  return request<AuthSession & { message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function register(payload: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
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
}) {
  return request<AuthSession & { message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(token: string) {
  return request<{ user: AuthSession["user"] }>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}