/**
 * quiz-result controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });
    const roleName = fullUser?.role?.name;

    if (roleName === 'Student') {
      const records = await strapi.query('api::quiz-result.quiz-result').findMany({
        where: { student: user.id },
        populate: ['student', 'quiz'],
      });
      ctx.body = { data: records };
      return;
    }

    if (roleName === 'Instructor') {
      // Same JS-side filtering approach as LessonProgress, avoiding the
      // relation-to-User filter bug.
      const allCourses = await strapi.query('api::course.course').findMany({
        populate: ['instructors', 'quizzes'],
      });

      const myCourses = allCourses.filter((c: any) =>
        c.instructors?.some((i: any) => i.id === user.id)
      );

      const quizIds = myCourses.flatMap((c: any) => c.quizzes?.map((q: any) => q.id) || []);

      if (quizIds.length === 0) {
        ctx.body = { data: [] };
        return;
      }

      const records = await strapi.query('api::quiz-result.quiz-result').findMany({
        where: { quiz: { id: { $in: quizIds } } },
        populate: ['student', 'quiz'],
      });
      ctx.body = { data: records };
      return;
    }

    // Admin / Content Manager — full unfiltered view
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });
    const roleName = fullUser?.role?.name;

    const { id } = ctx.params;
    const idWhereClause =
      typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

    if (roleName === 'Student') {
      const record = await strapi.query('api::quiz-result.quiz-result').findOne({
        where: idWhereClause,
        populate: ['student'],
      });
      if (!record || record.student?.id !== user.id) {
        return ctx.forbidden("You don't have access to this quiz result");
      }
    }

    if (roleName === 'Instructor') {
      const record = await strapi.query('api::quiz-result.quiz-result').findOne({
        where: idWhereClause,
        populate: { quiz: { populate: ['course'] } },
      });

      const courseId = record?.quiz?.course?.id;
      if (!courseId) {
        return ctx.forbidden("You don't have access to this quiz result");
      }

      const course = await strapi.query('api::course.course').findOne({
        where: { id: courseId },
        populate: ['instructors'],
      });

      const isAssigned = course?.instructors?.some((i: any) => i.id === user.id);
      if (!isAssigned) {
        return ctx.forbidden("You don't have access to this quiz result");
      }
    }

    return await super.findOne(ctx);
  },

  // Only Student may create — always forced to themselves.
  // NOTE: score is currently taken as-is from the client — this is
  // temporary, replaced with real server-side auto-grading next.
  async create(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name !== 'Student') {
      return ctx.forbidden('Only Student may submit quiz results');
    }

    const body = ctx.request.body?.data || {};
    if (!body.quiz) {
      return ctx.badRequest('quiz is required');
    }

    const entry = await strapi.documents('api::quiz-result.quiz-result').create({
      data: {
        student: user.id,
        quiz: body.quiz,
        score: body.score ?? 0, // placeholder — real grading next
        answers: body.answers ?? {},
        submittedAt: new Date().toISOString(),
      },
      populate: ['student', 'quiz'],
    });

    ctx.body = { data: entry };
  },

  // No update — results are immutable once submitted, per spec.
  async update(ctx) {
    return ctx.forbidden('Quiz results cannot be modified after submission');
  },

  // Only Admin may delete (per your decision — remove bad/duplicate attempts).
  async delete(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name !== 'Admin') {
      return ctx.forbidden('Only Admin may delete quiz results');
    }

    return await super.delete(ctx);
  },
}));