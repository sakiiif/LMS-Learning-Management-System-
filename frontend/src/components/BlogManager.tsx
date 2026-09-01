'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blocksToText } from '@/lib/textBlocks';

type BlogPost = {
  id: number;
  documentId: string;
  title: string;
  body: any;
  coverImageUrl: string | null;
  isPublished: boolean;
  author: { id: number; username: string; fullName?: string } | null;
};

export default function BlogManager({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, coverImageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle('');
      setBody('');
      setCoverImageUrl('');
      setShowForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(documentId: string, currentlyPublished: boolean) {
    await fetch(`/api/blog/${documentId}/publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish: !currentlyPublished }),
    });
    router.refresh();
  }

  async function handleDelete(documentId: string) {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/blog/${documentId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Blog Posts</h2>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-slate-900 font-medium underline">
          {showForm ? 'Cancel' : '+ New Post'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <input
            type="text" required placeholder="Title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text" placeholder="Cover image URL (optional)" value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            required placeholder="Write your post... (one paragraph per line)" value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={submitting}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save as Draft'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{post.title}</p>
                <p className="text-xs text-slate-500">
                  by {post.author?.fullName || post.author?.username || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {post.isPublished ? (
                  <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md font-medium">
                    Published
                  </span>
                ) : (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium">
                    Draft
                  </span>
                )}
                <button
                  onClick={() => togglePublish(post.documentId, post.isPublished)}
                  className="text-xs text-slate-600 hover:underline"
                >
                  {post.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => handleDelete(post.documentId)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{blocksToText(post.body)}</p>
          </div>
        ))}
        {posts.length === 0 && <p className="text-slate-500 text-sm">No blog posts yet.</p>}
      </div>
    </div>
  );
}