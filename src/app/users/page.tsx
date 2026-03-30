'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserTable } from '@/components/users/UserTable';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { EditUserModal } from '@/components/users/EditUserModal';
import { DeleteConfirmDialog } from '@/components/users/DeleteConfirmDialog';
import { UserDetailPanel } from '@/components/users/UserDetailPanel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { UserSummary } from '@/lib/gitea/types';

const PAGE_SIZE = 50;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserSummary | null>(null);

  const { users, total, isLoading, isError, error, refetch } = useUsers(page, PAGE_SIZE);

  // Client-side search filter
  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.login.toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q)
    );
  });

  const hasMore = users.length === PAGE_SIZE;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="로고" className="w-7 h-7 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Gitea 사용자 관리</h1>
              <p className="text-xs text-gray-500 mt-0.5">관리자 콘솔</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 사용자
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="사용자명, 이메일, 이름으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-400 focus:ring-blue-200"
            />
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && (
              <span className="text-sm text-gray-500">
                {search
                  ? `검색 ${filtered.length}명 / 현재 페이지 ${users.length}명 / 전체 ${total !== null ? total : '-'}명`
                  : `현재 페이지 ${users.length}명 / 전체 ${total !== null ? total : users.length}명`}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => void refetch()}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              새로고침
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-lg w-full">
              <p className="text-sm font-semibold text-red-800">사용자 목록을 불러오지 못했습니다.</p>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : '알 수 없는 오류'}
              </p>
            </div>
            <Button variant="secondary" onClick={() => void refetch()}>
              다시 시도
            </Button>
          </div>
        ) : (
          <>
            <UserTable
              users={filtered}
              onDeleteClick={(user) => setDeleteTarget(user)}
              onEditClick={(user) => setEditTarget(user)}
              onDetailClick={(user) => setDetailTarget(user)}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">페이지 {page}</span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        user={editTarget}
      />
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        username={deleteTarget?.login ?? null}
      />
      <UserDetailPanel
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        user={detailTarget}
      />
    </div>
  );
}
