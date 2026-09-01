export default {
  async listAllPosts(ctx: any) {
    const draftPosts = await strapi.documents('api::blog-post.blog-post').findMany({
      status: 'draft',
      populate: ['author'],
    });
    const publishedPosts = await strapi.documents('api::blog-post.blog-post').findMany({
      status: 'published',
      populate: ['author'],
    });
    const publishedIds = new Set(publishedPosts.map((p: any) => p.documentId));

    const merged = draftPosts.map((p: any) => ({
      id: p.id,
      documentId: p.documentId,
      title: p.title,
      body: p.body,
      coverImageUrl: p.coverImageUrl,
      author: p.author ? { id: p.author.id, username: p.author.username, fullName: p.author.fullName } : null,
      isPublished: publishedIds.has(p.documentId),
      updatedAt: p.updatedAt,
    }));

    ctx.body = { data: merged };
  },

  async createPost(ctx: any) {
    const user = ctx.state.user;
    const { title, body, coverImageUrl } = ctx.request.body;

    if (!title || !body) {
      return ctx.badRequest('title and body are required');
    }

    const entry = await strapi.documents('api::blog-post.blog-post').create({
      data: {
        title,
        body,
        coverImageUrl: coverImageUrl || null,
        author: user.id,
      },
    });

    ctx.body = { data: entry };
  },

  async updatePost(ctx: any) {
    const { documentId } = ctx.params;
    const { title, body, coverImageUrl } = ctx.request.body;

    const entry = await strapi.documents('api::blog-post.blog-post').update({
      documentId,
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      },
    });

    ctx.body = { data: entry };
  },

  async publishPost(ctx: any) {
    const { documentId } = ctx.params;
    await strapi.documents('api::blog-post.blog-post').publish({ documentId });
    ctx.body = { data: { success: true } };
  },

  async unpublishPost(ctx: any) {
    const { documentId } = ctx.params;
    await strapi.documents('api::blog-post.blog-post').unpublish({ documentId });
    ctx.body = { data: { success: true } };
  },

  async deletePost(ctx: any) {
    const { documentId } = ctx.params;
    await strapi.documents('api::blog-post.blog-post').delete({ documentId });
    ctx.body = { data: { success: true } };
  },
};