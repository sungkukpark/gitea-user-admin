import type { UserSummary, CreateUserInput, UpdateUserInput, GiteaApiError } from './types';

function getConfig() {
  const baseUrl = process.env.GITEA_BASE_URL;
  const token = process.env.GITEA_ADMIN_TOKEN;

  if (!baseUrl) {
    throw new Error('GITEA_BASE_URL environment variable is not set');
  }
  if (!token) {
    throw new Error('GITEA_ADMIN_TOKEN environment variable is not set');
  }

  return { baseUrl: baseUrl.replace(/\/$/, ''), token };
}

async function giteaFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; totalCount: number | null }> {
  const { baseUrl, token } = getConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${baseUrl}/api/v1${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `token ${token}`,
        ...(options.headers ?? {}),
      },
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const body = (await res.json()) as GiteaApiError;
        if (body.message) {
          errorMessage = body.message;
        }
      } catch {
        // ignore JSON parse errors
      }
      const err = new Error(errorMessage) as Error & { status: number };
      err.status = res.status;
      throw err;
    }

    const totalCount = res.headers.get('X-Total-Count');

    if (res.status === 204) {
      return { data: undefined as T, totalCount: null };
    }

    return { data: (await res.json()) as T, totalCount: totalCount ? parseInt(totalCount, 10) : null };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const giteaClient = {
  async listUsers(page: number = 1, limit: number = 50): Promise<{ users: UserSummary[]; total: number | null }> {
    const { data, totalCount } = await giteaFetch<UserSummary[]>(
      `/admin/users?page=${page}&limit=${limit}`
    );
    return { users: data, total: totalCount };
  },

  async getUser(username: string): Promise<UserSummary> {
    const { data } = await giteaFetch<UserSummary>(`/users/${encodeURIComponent(username)}`);
    return data;
  },

  async createUser(input: CreateUserInput): Promise<UserSummary> {
    const { data } = await giteaFetch<UserSummary>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data;
  },

  async updateUser(username: string, input: UpdateUserInput): Promise<UserSummary> {
    const { data } = await giteaFetch<UserSummary>(`/admin/users/${encodeURIComponent(username)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return data;
  },

  async deleteUser(username: string): Promise<void> {
    await giteaFetch<void>(`/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
    });
  },
};
