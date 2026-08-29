// src/api/enrollment/controllers/enrollment.ts

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name === 'Student') {
      // Bypass super.find() — Strapi's content-API query validator has the
      // same "Invalid key" bug when filtering on relations to the User
      // model. Use strapi.query() directly instead.
      const enrollments = await strapi.query('api::enrollment.enrollment').findMany({
        where: { student: user.id },
        populate: ['student', 'course'],
      });

      ctx.body = { data: enrollments };
      return;
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name === 'Student') {
      const { id } = ctx.params;
      const idWhereClause =
        typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

      const enrollment = await strapi.query('api::enrollment.enrollment').findOne({
        where: idWhereClause,
        populate: ['student'],
      });

      if (!enrollment || enrollment.student?.id !== user.id) {
        return ctx.forbidden("You don't have access to this enrollment");
      }
    }

    return await super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    const roleName = fullUser?.role?.name;
    const body = ctx.request.body?.data || {};

    let studentId: number | undefined;

    if (roleName === 'Student') {
      studentId = user.id;
    } else if (roleName === 'Admin') {
      studentId = body.student;
      if (!studentId) {
        return ctx.badRequest('student is required');
      }
    } else {
      return ctx.forbidden('Only Admin or Student may create enrollments');
    }

    if (!body.course) {
      return ctx.badRequest('course is required');
    }

    const entry = await strapi.documents('api::enrollment.enrollment').create({
      data: {
        student: studentId,
        course: body.course,
        enrolledAt: body.enrolledAt || new Date().toISOString(),
      },
      populate: ['student', 'course'],
    });

    ctx.body = { data: entry };
  },
}));