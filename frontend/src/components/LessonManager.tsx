'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lesson } from '@/types';

export default function LessonManager({
  courseDocumentId,
  lessons,
}: {
  courseDocumentId: string;
  lessons: Lesson[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          videoUrl: videoUrl || undefined,
          order: lessons.length + 1,
          course: courseDocumentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle('');
      setContent('');
      setVideoUrl('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(documentId: string) {
    if (!confirm('Delete this lesson?')) return;
    await fetch(`/api/lessons/${documentId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Lessons</h2>

      <div className="space-y-2 mb-4">
        {lessons.map((lesson, i) => (
          <div key={lesson.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
            <span className="text-slate-900">{i + 1}. {lesson.title}</span>
            <button onClick={() => handleDelete(lesson.documentId)} className="text-xs text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ))}
        {lessons.length === 0 && <p className="text-slate-500 text-sm">No lessons yet.</p>}
      </div>

      <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Add a lesson</p>
        <input
          type="text"
          required
          placeholder="Lesson title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Video URL (optional)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add Lesson'}
        </button>
      </form>
    </div>
  );
}