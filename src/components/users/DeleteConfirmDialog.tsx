'use client';

import { useState } from 'react';
import { useDeleteUser } from '@/hooks/useUsers';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/errors';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  username: string | null;
  /** Called after a successful delete, before onClose */
  onDeleted?: () => void;
}

export function DeleteConfirmDialog({ open, onClose, username, onDeleted }: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const { showToast } = useToast();
  const deleteUser = useDeleteUser();

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleDelete = async () => {
    if (!username || confirmText !== username) return;
    try {
      await deleteUser.mutateAsync(username);
      showToast('success', `사용자 "${username}"가 삭제되었습니다.`);
      onDeleted?.();
      handleClose();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  if (!username) return null;

  const isConfirmed = confirmText === username;

  return (
    <Modal open={open} onClose={handleClose} title="사용자 삭제" maxWidth="sm">
      <div className="flex flex-col gap-4">
        {/* Warning icon + text */}
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">이 작업은 되돌릴 수 없습니다.</p>
            <p className="text-sm text-red-700 mt-1">
              사용자 <strong className="font-semibold">{username}</strong>의 계정과 모든 관련 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-700">
            확인을 위해 사용자명{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-900">
              {username}
            </code>
            을 입력하세요:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={username}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-red-400 focus:ring-red-300"
            autoFocus
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={handleClose} disabled={deleteUser.isPending}>
          취소
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={!isConfirmed}
          loading={deleteUser.isPending}
        >
          삭제 확인
        </Button>
      </div>
    </Modal>
  );
}
