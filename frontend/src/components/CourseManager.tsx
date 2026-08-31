'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Course } from '@/types';

type InstructorOption = { id: number; username: string; fullName?: string };

export default function CourseManager({
  courses,
  instructorOptions,
}: {
  courses: Course[];
  instructorOptions: InstructorOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle('');
      setDescription('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCourse(documentId: string) {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await fetch(`/api/courses/${documentId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Courses</h2>

      <div className="space-y-3 mb-6">
        {courses.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            instructorOptions={instructorOptions}
            onDelete={() => handleDeleteCourse(course.documentId)}
          />
        ))}
        {courses.length === 0 && <p className="text-slate-500 text-sm">No courses yet.</p>}
      </div>

      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Create a course</p>
        <input
          type="text"
          required
          placeholder="Course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={2}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create Course'}
        </button>
      </form>
    </div>
  );
}

function CourseRow({
  course,
  instructorOptions,
  onDelete,
}: {
  course: Course;
  instructorOptions: InstructorOption[];
  onDelete: () => void;
}) {
  const router = useRouter();
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [busy, setBusy] = useState(false);

  const assignedIds = new Set((course.instructors || []).map((i: any) => i.id));
  const availableToAdd = instructorOptions.filter((i) => !assignedIds.has(i.id));

  async function handleAdd() {
    if (!selectedToAdd) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/courses/${course.documentId}/instructors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId: Number(selectedToAdd) }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to add instructor');
        return;
      }
      setSelectedToAdd('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(instructorId: number) {
    setBusy(true);
    try {
      await fetch(`/api/courses/${course.documentId}/instructors/${instructorId}`, {
        method: 'DELETE',
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-slate-900">{course.title}</p>
          {course.description && <p className="text-sm text-slate-500">{course.description}</p>}
        </div>
        <button onClick={onDelete} className="text-xs text-red-600 hover:underline">
          Delete Course
        </button>
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <p className="text-xs text-slate-500 mb-1">Instructors</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {(course.instructors || []).map((i: any) => (
            <span key={i.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
              {i.fullName || i.username}
              <button onClick={() => handleRemove(i.id)} disabled={busy} className="text-red-600 font-bold ml-1">
                ×
              </button>
            </span>
          ))}
          {(!course.instructors || course.instructors.length === 0) && (
            <span className="text-xs text-slate-400">No instructors assigned</span>
          )}
        </div>

        {availableToAdd.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedToAdd}
              onChange={(e) => setSelectedToAdd(e.target.value)}
              className="text-sm rounded-md border border-slate-300 px-2 py-1 flex-1"
            >
              <option value="">Select instructor to add…</option>
              {availableToAdd.map((i) => (
                <option key={i.id} value={i.id}>{i.fullName || i.username}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={busy || !selectedToAdd}
              className="text-xs bg-slate-900 text-white px-3 py-1 rounded-md disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}