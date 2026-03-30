'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
} from '@/lib/api-client';
import type { CreateUserInput, UpdateUserInput } from '@/lib/gitea/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...userKeys.lists(), { page, limit }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (username: string) => [...userKeys.details(), username] as const,
};

export function useUsers(page: number = 1, limit: number = 50) {
  const query = useQuery({
    queryKey: userKeys.list(page, limit),
    queryFn: () => fetchUsers(page, limit),
  });
  return {
    ...query,
    users: query.data?.users ?? [],
    total: query.data?.total ?? null,
  };
}

export function useUser(username: string) {
  return useQuery({
    queryKey: userKeys.detail(username),
    queryFn: () => fetchUser(username),
    enabled: !!username,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      input,
    }: {
      username: string;
      input: UpdateUserInput;
    }) => updateUser(username, input),
    onSuccess: (_data, { username }) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(username) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => deleteUser(username),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
