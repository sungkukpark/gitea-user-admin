import { NextRequest, NextResponse } from 'next/server';
import { giteaClient } from '@/lib/gitea/client';
import { updateUserSchema } from '@/lib/gitea/schemas';
import { mapGiteaError } from '@/lib/errors';

type RouteParams = { params: Promise<{ username: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const user = await giteaClient.getUser(username);
    return NextResponse.json(user);
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = mapGiteaError(status, err.message ?? '알 수 없는 오류');
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const body: unknown = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', fieldErrors },
        { status: 422 }
      );
    }

    // Remove empty string values so they don't overwrite existing data
    const input = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== '' && v !== undefined)
    );

    const user = await giteaClient.updateUser(username, input);
    return NextResponse.json(user);
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = mapGiteaError(status, err.message ?? '알 수 없는 오류');
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    await giteaClient.deleteUser(username);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = mapGiteaError(status, err.message ?? '알 수 없는 오류');
    return NextResponse.json({ error: message }, { status });
  }
}
