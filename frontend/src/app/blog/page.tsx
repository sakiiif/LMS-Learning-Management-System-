import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { blocksToText } from '@/lib/textBlocks';

export default async function PublicBlogPage() {
  const res = await apiFetch('/api/blog-posts?populate=author');
  const posts = res.data;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Blog</h1>
        <div className="space-y-4">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.documentId}`}
              className="block bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors"
            >
              <h2 className="font-medium text-slate-900">{post.title}</h2>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{blocksToText(post.body)}</p>
            </Link>
          ))}
          {posts.length === 0 && <p className="text-slate-500">No posts published yet.</p>}
        </div>
      </div>
    </div>
  );
}