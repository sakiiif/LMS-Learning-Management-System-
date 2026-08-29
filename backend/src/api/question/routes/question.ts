/**
 * question router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::question.question', {
  config: {
    create: {
      policies: [
        { name: 'global::is-quiz-course-instructor', config: { contentType: 'api::question.question' } },
      ],
    },
    update: {
      policies: [
        { name: 'global::is-quiz-course-instructor', config: { contentType: 'api::question.question' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-quiz-course-instructor', config: { contentType: 'api::question.question' } },
      ],
    },
  },
});