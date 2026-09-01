import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/api';
import { textToBlocks } from '@/lib/textBlocks';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  try {
    const data = await apiFetch(`/api/blog-panel/posts/${documentId}`, {
      method: 'PUT',
      token,
      body: {
        title: body.title,
        body: textToBlocks(body.body),
        coverImageUrl: body.coverImageUrl,
      },
    });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    await apiFetch(`/api/blog-panel/posts/${documentId}`, { method: 'DELETE', token });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}