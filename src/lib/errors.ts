export class GiteaError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'GiteaError';
  }
}

export function mapGiteaError(status: number, message: string): string {
  if (status === 401 || status === 403) {
    return '인증 오류: 토큰이 유효하지 않거나 권한이 없습니다.';
  }
  if (status === 404) {
    return '사용자를 찾을 수 없습니다.';
  }
  if (status === 409) {
    return '이미 존재하는 사용자명 또는 이메일입니다.';
  }
  if (status === 422) {
    return `입력값 오류: ${message}`;
  }
  if (status >= 500) {
    return 'Gitea 서버 오류가 발생했습니다.';
  }
  return message;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof GiteaError) {
    return mapGiteaError(error.status, error.message);
  }
  if (error instanceof Error) {
    const statusErr = error as Error & { status?: number };
    if (typeof statusErr.status === 'number') {
      return mapGiteaError(statusErr.status, error.message);
    }
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}
