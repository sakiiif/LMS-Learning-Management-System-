import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/api';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string; instructorId: string }> }
) {
  const { documentId, instructorId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const data = await apiFetch(
      `/api/admin-panel/courses/${documentId}/instructors/${instructorId}`,
      { method: 'DELETE', token }
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}