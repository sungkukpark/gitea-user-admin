export type UserSummary = {
  id: number;
  login: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  restricted: boolean;
  active: boolean;
  avatar_url: string;
  created: string;
  last_login: string | null;
  source_id: number;
  login_name: string;
};

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  must_change_password: boolean;
  send_notify?: boolean;
  full_name?: string;
  login_name?: string;
  source_id?: number;
};

export type UpdateUserInput = {
  email?: string;
  password?: string;
  full_name?: string;
  website?: string;
  location?: string;
  admin?: boolean;
  active?: boolean;
  restricted?: boolean;
  must_change_password?: boolean;
  login_name?: string;
  source_id?: number;
};

export type GiteaApiError = {
  message: string;
  url?: string;
};
