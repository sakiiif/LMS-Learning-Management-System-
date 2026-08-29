/**
 * quiz controller
 */

/**
 * quiz controller
 */
/*
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz');
*/

/**
 * quiz controller
 */

import { factories } from '@strapi/strapi';

function stripAnswersFromQuestions(quiz: any) {
  if (!quiz?.questions) return quiz;
  return {
    ...quiz,
    questions: quiz.questions.map((q: any) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    }),
  };
}

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async find(ctx) {
    const response = await super.find(ctx);

    const user = ctx.state.user;
    if (!user) return response;

    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name === 'Student' && Array.isArray(response?.data)) {
      response.data = response.data.map(stripAnswersFromQuestions);
    }

    return response;
  },

  async findOne(ctx) {
    const response = await super.findOne(ctx);

    const user = ctx.state.user;
    if (!user) return response;

    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name === 'Student' && response?.data) {
      response.data = stripAnswersFromQuestions(response.data);
    }

    return response;
  },
}));

/*
import { factories } from '@strapi/strapi';

type ResponseBody = {
  data?: any[];
};

function stripAnswersFromQuestions(quiz: any) {
  if (!quiz?.questions) return quiz;
  return {
    ...quiz,
    questions: quiz.questions.map((q: any) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    }),
  };
}

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async find(ctx) {
    await super.find(ctx);

    const user = ctx.state.user;
    if (!user) return;

    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    const body = ctx.body as ResponseBody;

    if (fullUser?.role?.name === 'Student' && Array.isArray(body?.data)) {
      body.data = body.data.map(stripAnswersFromQuestions);
    }
  },

  async findOne(ctx) {
    await super.findOne(ctx);

    const user = ctx.state.user;
    if (!user) return;

    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    const body = ctx.body as ResponseBody;

    if (fullUser?.role?.name === 'Student' && body?.data) {
      body.data = stripAnswersFromQuestions(body.data);
    }
  },
}));
*/