'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUsers';
import { useToast } from '@/components/ui/Toast';
import { EditUserModal } from '@/components/users/EditUserModal';
import { DeleteConfirmDialog } from '@/components/users/DeleteConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex py-3 border-b border-gray-100 last:border-0 gap-4">
      <span className="w-40 flex-shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <div className="text-sm text-gray-900 break-all">
        {children ?? <span className="text-gray-400">-</span>}
      </div>
    </div>
  );
}

// In Next.js 16 (React 19), params is a Promise — unwrap with React.use()
type PageProps = { params: Promise<{ username: string }> };

export default function UserDetailPage(props: PageProps) {
  const { username } = use(props.params);
  const router = useRouter();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: user, isLoading, isError, error, refetch } = useUser(username);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-md w-full">
          <p className="text-sm font-semibold text-red-800">
            사용자 정보를 불러오지 못했습니다.
          </p>
          <p className="text-sm text-red-700 mt-1">
            {error instanceof Error ? error.message : '알 수 없는 오류'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void refetch()}>
            다시 시도
          </Button>
          <Link href="/users">
            <Button variant="ghost">목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link
            href="/users"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="목록으로"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-none">{user.login}</h1>
            <p className="text-xs text-gray-500 mt-0.5">사용자 상세</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              수정
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              삭제
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-20 h-20 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                {user.login.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.login}</h2>
              {user.full_name && (
                <p className="text-gray-500 mt-0.5">{user.full_name}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {user.is_admin && <Badge variant="blue">관리자</Badge>}
                {user.active ? (
                  <Badge variant="green">활성</Badge>
                ) : (
                  <Badge variant="red">비활성</Badge>
                )}
                {user.restricted && <Badge variant="yellow">제한됨</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            계정 정보
          </h3>
          <div className="flex flex-col">
            <DetailRow label="사용자 ID">{user.id}</DetailRow>
            <DetailRow label="사용자명">
              <span className="select-all font-mono">{user.login}</span>
            </DetailRow>
            <DetailRow label="이메일">
              {user.email ? (
                <span className="flex items-center gap-2">
                  <span className="select-all">{user.email}</span>
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(user.email ?? '');
                      showToast('info', '이메일 주소가 복사되었습니다.');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="복사"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </span>
              ) : null}
            </DetailRow>
            <DetailRow label="이름">{user.full_name || null}</DetailRow>
            <DetailRow label="로그인 소스 ID">{user.source_id || null}</DetailRow>
            <DetailRow label="생성일">{formatDate(user.created)}</DetailRow>
            <DetailRow label="마지막 로그인">{formatDate(user.last_login)}</DetailRow>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">
            위험 구역
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">사용자 삭제</p>
              <p className="text-sm text-gray-500 mt-0.5">
                이 사용자와 모든 관련 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="flex-shrink-0"
            >
              삭제
            </Button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EditUserModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        username={user.login}
        onDeleted={() => router.push('/users')}
      />
    </div>
  );
}
