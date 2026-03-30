'use client';

import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { UserSummary } from '@/lib/gitea/types';

interface UserDetailPanelProps {
  open: boolean;
  onClose: () => void;
  user: UserSummary | null;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-36 flex-shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 break-all">{value ?? <span className="text-gray-400">-</span>}</span>
    </div>
  );
}

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

export function UserDetailPanel({ open, onClose, user }: UserDetailPanelProps) {
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title={`사용자 상세: ${user.login}`} maxWidth="md">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-14 h-14 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {user.login.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.login}</p>
          {user.full_name && (
            <p className="text-sm text-gray-500">{user.full_name}</p>
          )}
          <div className="flex gap-1.5 mt-1.5">
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

      <div className="flex flex-col">
        <DetailRow label="사용자 ID" value={user.id} />
        <DetailRow label="사용자명" value={user.login} />
        <DetailRow
          label="이메일"
          value={
            user.email ? (
              <span className="flex items-center gap-2">
                {user.email}
                <button
                  onClick={() => navigator.clipboard.writeText(user.email ?? '')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="복사"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </span>
            ) : null
          }
        />
        <DetailRow label="이름" value={user.full_name || null} />
        <DetailRow
          label="관리자"
          value={
            user.is_admin ? (
              <Badge variant="blue">예</Badge>
            ) : (
              <span className="text-gray-400 text-sm">아니오</span>
            )
          }
        />
        <DetailRow
          label="계정 상태"
          value={
            user.active ? (
              <Badge variant="green">활성</Badge>
            ) : (
              <Badge variant="red">비활성</Badge>
            )
          }
        />
        <DetailRow
          label="제한 계정"
          value={
            user.restricted ? (
              <Badge variant="yellow">제한됨</Badge>
            ) : (
              <span className="text-gray-400 text-sm">아니오</span>
            )
          }
        />
        <DetailRow label="로그인 소스 ID" value={user.source_id || null} />
        <DetailRow label="생성일" value={formatDate(user.created)} />
        <DetailRow label="마지막 로그인" value={formatDate(user.last_login)} />
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          닫기
        </button>
      </div>
    </Modal>
  );
}
