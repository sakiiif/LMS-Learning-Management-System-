/**
 * question controller
 */

import { factories } from '@strapi/strapi';

function stripCorrectAnswer(question: any) {
  if (!question) return question;
  const { correctAnswer, ...rest } = question;
  return rest;
}

export default factories.createCoreController('api::question.question', ({ strapi }) => ({
  async find(ctx) {
    const response = await super.find(ctx);

    const user = ctx.state.user;
    if (!user) return response;

    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name === 'Student' && Array.isArray(response?.data)) {
      response.data = response.data.map(stripCorrectAnswer);
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
      response.data = stripCorrectAnswer(response.data);
    }

    return response;
  },
}));