'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz } from '@/types';

export default function QuizManager({
  courseDocumentId,
  quizzes,
}: {
  courseDocumentId: string;
  quizzes: Quiz[];
}) {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAddQuiz(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: quizTitle, course: courseDocumentId }),
      });
      if (!res.ok) throw new Error('Failed');
      setQuizTitle('');
      router.refresh();
    } catch {
      alert('Failed to add quiz');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Quizzes</h2>

      <div className="space-y-4 mb-4">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
        {quizzes.length === 0 && <p className="text-slate-500 text-sm">No quizzes yet.</p>}
      </div>

      <form onSubmit={handleAddQuiz} className="bg-white border border-slate-200 rounded-lg p-4 flex gap-2">
        <input
          type="text"
          required
          placeholder="Quiz title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          Add Quiz
        </button>
      </form>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          options: options.filter((o) => o.trim()),
          correctAnswer,
          quiz: quiz.documentId,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setText('');
      setOptions(['', '']);
      setCorrectAnswer('');
      setShowForm(false);
      router.refresh();
    } catch {
      alert('Failed to add question');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-slate-900">{quiz.title}</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-slate-600 hover:underline"
        >
          {showForm ? 'Cancel' : '+ Add question'}
        </button>
      </div>

      <ul className="text-sm text-slate-500 space-y-1 mb-2">
        {(quiz.questions || []).map((q, i) => (
          <li key={q.id}>{i + 1}. {q.text}</li>
        ))}
        {(!quiz.questions || quiz.questions.length === 0) && <li>No questions yet.</li>}
      </ul>

      {showForm && (
        <form onSubmit={handleAddQuestion} className="space-y-2 border-t border-slate-100 pt-3 mt-2">
          <input
            type="text"
            required
            placeholder="Question text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              required
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, ''])}
            className="text-xs text-slate-600 hover:underline"
          >
            + Add option
          </button>
          <select
            required
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select correct answer</option>
            {options.filter((o) => o.trim()).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Question'}
          </button>
        </form>
      )}
    </div>
  );
}