/**
 * quiz router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::quiz.quiz', {
  config: {
    create: {
      policies: [
        { name: 'global::is-course-instructor', config: { contentType: 'api::quiz.quiz' } },
      ],
    },
    update: {
      policies: [
        { name: 'global::is-course-instructor', config: { contentType: 'api::quiz.quiz' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-course-instructor', config: { contentType: 'api::quiz.quiz' } },
      ],
    },
  },
});