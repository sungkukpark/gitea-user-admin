'use client';

import { useState } from 'react';
import { createUserSchema } from '@/lib/gitea/schemas';
import { useCreateUser } from '@/hooks/useUsers';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  username: string;
  email: string;
  password: string;
  full_name: string;
  must_change_password: boolean;
  send_notify: boolean;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
}

const defaultForm: FormState = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  must_change_password: true,
  send_notify: false,
};

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const createUser = useCreateUser();

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = createUserSchema.safeParse({
      username: form.username,
      email: form.email,
      password: form.password,
      full_name: form.full_name || undefined,
      must_change_password: form.must_change_password,
      send_notify: form.send_notify,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await createUser.mutateAsync({
        username: result.data.username,
        email: result.data.email,
        password: result.data.password,
        must_change_password: result.data.must_change_password,
        send_notify: result.data.send_notify,
        full_name: result.data.full_name || undefined,
      });
      showToast('success', `사용자 "${result.data.username}"가 생성되었습니다.`);
      handleClose();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="새 사용자 생성" maxWidth="md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          <Input
            label="사용자명 *"
            placeholder="예: john.doe"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            error={errors.username}
            autoFocus
          />

          <Input
            label="이메일 *"
            type="email"
            placeholder="예: john@example.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />

          <Input
            label="이름 (선택)"
            placeholder="예: John Doe"
            value={form.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            error={errors.full_name}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">비밀번호 *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="8자 이상 입력"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={[
                  'block w-full rounded-md border px-3 py-2 text-sm shadow-sm pr-10',
                  'placeholder-gray-400 focus:outline-none focus:ring-2',
                  errors.password
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : 'border-gray-300 focus:border-blue-400 focus:ring-blue-200',
                ].join(' ')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={form.must_change_password}
                onChange={(e) => handleChange('must_change_password', e.target.checked)}
              />
              <span className="text-sm text-gray-700">첫 로그인 시 비밀번호 변경 요구</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={form.send_notify}
                onChange={(e) => handleChange('send_notify', e.target.checked)}
              />
              <span className="text-sm text-gray-700">이메일 알림 전송</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createUser.isPending}>
            취소
          </Button>
          <Button type="submit" loading={createUser.isPending}>
            사용자 생성
          </Button>
        </div>
      </form>
    </Modal>
  );
}
