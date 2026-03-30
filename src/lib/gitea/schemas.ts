import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, '사용자명은 필수입니다.')
    .max(40, '사용자명은 40자 이하여야 합니다.')
    .regex(
      /^[a-zA-Z0-9_\-.]+$/,
      '사용자명은 영문, 숫자, _, -, . 만 사용할 수 있습니다.'
    ),
  email: z
    .string()
    .min(1, '이메일은 필수입니다.')
    .email('유효한 이메일 주소를 입력하세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(255, '비밀번호는 255자 이하여야 합니다.'),
  full_name: z.string().max(100, '이름은 100자 이하여야 합니다.').optional(),
  must_change_password: z.boolean().default(false),
  send_notify: z.boolean().optional(),
  login_name: z.string().optional(),
  source_id: z.number().optional(),
});

export const updateUserSchema = z.object({
  email: z
    .string()
    .email('유효한 이메일 주소를 입력하세요.')
    .optional(),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(255, '비밀번호는 255자 이하여야 합니다.')
    .optional(),
  full_name: z.string().max(100, '이름은 100자 이하여야 합니다.').optional(),
  website: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  admin: z.boolean().optional(),
  active: z.boolean().optional(),
  restricted: z.boolean().optional(),
  must_change_password: z.boolean().optional(),
  login_name: z.string().optional(),
  source_id: z.number().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
