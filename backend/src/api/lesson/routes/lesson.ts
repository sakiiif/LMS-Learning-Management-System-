/**
 * lesson router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::lesson.lesson', {
  config: {
    create: {
      policies: [
        { name: 'global::is-course-instructor', config: { contentType: 'api::lesson.lesson' } },
      ],
    },
    update: {
      policies: [
        { name: 'global::is-course-instructor', config: { contentType: 'api::lesson.lesson' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-course-instructor', config: { contentType: 'api::lesson.lesson' } },
      ],
    },
  },
});