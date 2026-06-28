export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  is_guest: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
}

export type AuthError = {
  message: string;
};
