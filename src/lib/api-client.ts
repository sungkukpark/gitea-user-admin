import type { UserSummary, CreateUserInput, UpdateUserInput } from './gitea/types';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let errorMessage = `오류 ${res.status}: ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      if (body.error) errorMessage = body.error;
      else if (body.message) errorMessage = body.message;
    } catch {
      // ignore
    }
    const err = new Error(errorMessage) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function fetchUsers(
  page: number = 1,
  limit: number = 50
): Promise<{ users: UserSummary[]; total: number | null }> {
  return apiFetch<{ users: UserSummary[]; total: number | null }>(`/api/users?page=${page}&limit=${limit}`);
}

export async function fetchUser(username: string): Promise<UserSummary> {
  return apiFetch<UserSummary>(`/api/users/${encodeURIComponent(username)}`);
}

export async function createUser(input: CreateUserInput): Promise<UserSummary> {
  return apiFetch<UserSummary>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateUser(
  username: string,
  input: UpdateUserInput
): Promise<UserSummary> {
  return apiFetch<UserSummary>(`/api/users/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteUser(username: string): Promise<void> {
  return apiFetch<void>(`/api/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  });
}
