import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { renderBlocks } from '@/lib/renderBlocks';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const res = await apiFetch(`/api/blog-posts/${documentId}`);
  const post = res.data;

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-block">
          ← Blog
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">{post.title}</h1>
        <div className="prose prose-slate max-w-none">{renderBlocks(post.body)}</div>
      </div>
    </div>
  );
}