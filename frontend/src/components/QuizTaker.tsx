'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz, QuizResult } from '@/types';

export default function QuizTaker({
  quiz,
  existingResult,
}: {
  quiz: Quiz;
  courseDocumentId: string;
  existingResult: QuizResult | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<QuizResult | null>(existingResult);

  const questions = quiz.questions || [];

  function selectAnswer(questionDocumentId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionDocumentId]: option }));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: quiz.documentId, answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      setResult(data.data);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Already-submitted view
  if (result) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
        <p className="text-sm text-slate-500 mb-1">Your score</p>
        <p className="text-3xl font-semibold text-slate-900">
          {result.score} / {result.totalQuestions ?? questions.length}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Submitted {new Date(result.submittedAt).toLocaleString()}
        </p>
      </div>
    );
  }

  // Quiz-taking view
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id} className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="font-medium text-slate-900 mb-3">
            {index + 1}. {question.text}
          </p>
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <label
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm ${
                  answers[question.documentId] === option
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.documentId}`}
                  checked={answers[question.documentId] === option}
                  onChange={() => selectAnswer(question.documentId, option)}
                  className="accent-slate-900"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <p className="text-slate-500 text-sm">This quiz has no questions yet.</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {questions.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-slate-900 text-white font-medium px-6 py-2.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Quiz'}
        </button>
      )}
    </div>
  );
}