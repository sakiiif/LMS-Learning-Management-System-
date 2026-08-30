'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkCompleteButton({
  lessonDocumentId,
  progressDocumentId,
  alreadyCompleted,
}: {
  lessonDocumentId: string;
  progressDocumentId: string | null;
  alreadyCompleted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleMarkComplete() {
    setLoading(true);
    setError('');
    try {
      const res = progressDocumentId
        ? await fetch('/api/lesson-progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progressDocumentId }),
          })
        : await fetch('/api/lesson-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lesson: lessonDocumentId }),
          });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update progress');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (alreadyCompleted) {
    return (
      <span className="inline-block text-sm text-green-700 bg-green-50 px-4 py-2 rounded-md font-medium">
        ✓ Completed
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleMarkComplete}
        disabled={loading}
        className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Mark as Complete'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}