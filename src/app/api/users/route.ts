import { NextRequest, NextResponse } from 'next/server';
import { giteaClient } from '@/lib/gitea/client';
import { createUserSchema } from '@/lib/gitea/schemas';
import { mapGiteaError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const { users, total } = await giteaClient.listUsers(page, limit);
    return NextResponse.json({ users, total });
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = mapGiteaError(status, err.message ?? '알 수 없는 오류');
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', fieldErrors },
        { status: 422 }
      );
    }

    const { username, email, password, must_change_password, send_notify, full_name, login_name, source_id } =
      parsed.data;

    const user = await giteaClient.createUser({
      username,
      email,
      password,
      must_change_password,
      send_notify,
      full_name: full_name || undefined,
      login_name: login_name || undefined,
      source_id,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = mapGiteaError(status, err.message ?? '알 수 없는 오류');
    return NextResponse.json({ error: message }, { status });
  }
}
