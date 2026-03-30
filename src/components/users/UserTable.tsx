'use client';

import type { UserSummary } from '@/lib/gitea/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface UserTableProps {
  users: UserSummary[];
  onDeleteClick: (user: UserSummary) => void;
  onEditClick?: (user: UserSummary) => void;
  onDetailClick?: (user: UserSummary) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return '-';
  }
}

export function UserTable({ users, onDeleteClick, onEditClick, onDetailClick }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg
          className="w-12 h-12 mb-4 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm">사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
              사용자명
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
              이름
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
              이메일
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
              상태
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
              등록일
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-blue-700 whitespace-nowrap">
                <button
                  onClick={() => onDetailClick?.(user)}
                  className="hover:underline text-left"
                >
                  {user.login}
                </button>
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {user.full_name || <span className="text-gray-400">-</span>}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                <span className="select-all">{user.email || '-'}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {user.is_admin && (
                    <Badge variant="blue">관리자</Badge>
                  )}
                  {user.active ? (
                    <Badge variant="green">활성</Badge>
                  ) : (
                    <Badge variant="red">비활성</Badge>
                  )}
                  {user.restricted && (
                    <Badge variant="yellow">제한</Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {formatDate(user.created)}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex justify-end gap-1">
                  {onDetailClick && (
                    <Button variant="ghost" size="sm" onClick={() => onDetailClick(user)} title="상세 보기">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                  )}
                  {onEditClick && (
                    <Button variant="ghost" size="sm" onClick={() => onEditClick(user)} title="수정">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onDeleteClick(user)}
                    title="삭제"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
