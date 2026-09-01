export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-panel/posts',
      handler: 'blog-panel.listAllPosts',
      config: { policies: ['global::is-admin-or-cm'] },
    },
    {
      method: 'POST',
      path: '/blog-panel/posts',
      handler: 'blog-panel.createPost',
      config: { policies: ['global::is-admin-or-cm'] },
    },
    {
      method: 'PUT',
      path: '/blog-panel/posts/:documentId',
      handler: 'blog-panel.updatePost',
      config: { policies: ['global::is-admin-or-cm'] },
    },
    {
      method: 'PUT',
      path: '/blog-panel/posts/:documentId/publish',
      handler: 'blog-panel.publishPost',
      config: { policies: ['global::is-admin-or-cm'] },
    },
    {
      method: 'PUT',
      path: '/blog-panel/posts/:documentId/unpublish',
      handler: 'blog-panel.unpublishPost',
      config: { policies: ['global::is-admin-or-cm'] },
    },
    {
      method: 'DELETE',
      path: '/blog-panel/posts/:documentId',
      handler: 'blog-panel.deletePost',
      config: { policies: ['global::is-admin-or-cm'] },
    },
  ],
};