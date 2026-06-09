const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const TOKEN_KEY = "sb_access_token";
const USER_KEY = "sb_user";

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
  };
}

function headers(bearer?: string): HeadersInit {
  const h: HeadersInit = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };
  if (bearer) h.Authorization = `Bearer ${bearer}`;
  return h;
}

// ── Sign Up ──────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password, data: { name } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Sign up failed");
  if (data.access_token) saveSession(data);
  return data;
}

// ── Sign In ──────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, password }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Sign in failed");
  saveSession(data);
  return data;
}

// ── Sign Out ─────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: headers(token),
    }).catch(() => {});
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Get User ─────────────────────────────────────────────────────────

export async function getUser(): Promise<AuthResponse["user"] | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: headers(token),
  });
  if (!res.ok) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  const user = await res.json();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

// ── Reset Password ───────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email,
      redirect_to: `${window.location.origin}/reset-password`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Reset password failed");
}

// ── Update Password ──────────────────────────────────────────────────

export async function updatePassword(
  newPassword: string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: headers(accessToken),
    body: JSON.stringify({ password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Update password failed");
}

// ── Session helpers ──────────────────────────────────────────────────

export function saveSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function getStoredUser(): AuthResponse["user"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
