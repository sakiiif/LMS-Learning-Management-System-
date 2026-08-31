// src/api/admin-panel/routes/admin-panel.ts

export default {
  routes: [
    {
      method: 'GET',
      path: '/admin-panel/users',
      handler: 'admin-panel.listUsers',
      config: { policies: ['global::is-admin'] },
    },
    {
      method: 'POST',
      path: '/admin-panel/users',
      handler: 'admin-panel.createUser',
      config: { policies: ['global::is-admin'] },
    },
    {
      method: 'PUT',
      path: '/admin-panel/users/:id/role',
      handler: 'admin-panel.updateUserRole',
      config: { policies: ['global::is-admin'] },
    },
    {
      method: 'GET',
      path: '/admin-panel/stats',
      handler: 'admin-panel.getStats',
      config: { policies: ['global::is-admin'] },
    },
    {
        method: 'DELETE',
        path: '/admin-panel/users/:id',
        handler: 'admin-panel.deleteUser',
        config: { policies: ['global::is-admin'] },
    },
    {
      method: 'POST',
      path: '/admin-panel/courses/:id/instructors',
      handler: 'admin-panel.addInstructor',
      config: {},
    },
    {
      method: 'DELETE',
      path: '/admin-panel/courses/:id/instructors/:instructorId',
      handler: 'admin-panel.removeInstructor',
      config: {},
    },
    {
      method: 'GET',
      path: '/admin-panel/courses-with-instructors',
      handler: 'admin-panel.allCoursesWithInstructors',
      config: {},
    },
  ],
};