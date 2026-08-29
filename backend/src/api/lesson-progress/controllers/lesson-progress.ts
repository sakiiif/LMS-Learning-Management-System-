/**
 * lesson-progress controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
async find(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });
    const roleName = fullUser?.role?.name;

    if (roleName === 'Student') {
      const records = await strapi.query('api::lesson-progress.lesson-progress').findMany({
        where: { student: user.id },
        populate: ['student', 'lesson'],
      });
      ctx.body = { data: records };
      return;
    }

    if (roleName === 'Instructor') {
      // Avoid filtering Course by its "instructors" relation directly
      // (relation-to-User filters throw Strapi's "Invalid key" bug).
      // Instead, fetch all courses with instructors populated, then
      // filter down to this instructor's courses in JS.
      const allCourses = await strapi.query('api::course.course').findMany({
        populate: ['instructors', 'lessons'],
      });

      //console.log("🔍 allCourses count:", allCourses.length);
      //console.log("🔍 first course instructors:", JSON.stringify(allCourses[0]?.instructors));
      //console.log("🔍 looking for user.id:", user.id);

      const myCourses = allCourses.filter((c: any) =>
        c.instructors?.some((i: any) => i.id === user.id)
      );
      //console.log("🔍 myCourses count:", myCourses.length);
      //console.log("🔍 myCourses raw:", JSON.stringify(myCourses.map((c: any) => ({ id: c.id, title: c.title, lessons: c.lessons }))));

      const lessonIds = myCourses.flatMap((c: any) => c.lessons?.map((l: any) => l.id) || []);
      //console.log("🔍 lessonIds:", lessonIds);

      if (lessonIds.length === 0) {
        ctx.body = { data: [] };
        return;
      }

      const records = await strapi.query('api::lesson-progress.lesson-progress').findMany({
        where: { lesson: { id: { $in: lessonIds } } },
        populate: ['student', 'lesson'],
      });

      //console.log("🔍 records found:", records.length);

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
      const record = await strapi.query('api::lesson-progress.lesson-progress').findOne({
        where: idWhereClause,
        populate: ['student'],
      });
      if (!record || record.student?.id !== user.id) {
        return ctx.forbidden("You don't have access to this progress record");
      }
    }

    if (roleName === 'Instructor') {
      const record = await strapi.query('api::lesson-progress.lesson-progress').findOne({
        where: idWhereClause,
        populate: { lesson: { populate: ['course'] } },
      });

      const courseId = record?.lesson?.course?.id;
      if (!courseId) {
        return ctx.forbidden("You don't have access to this progress record");
      }

      const course = await strapi.query('api::course.course').findOne({
        where: { id: courseId },
        populate: ['instructors'],
      });

      const isAssigned = course?.instructors?.some((i: any) => i.id === user.id);
      if (!isAssigned) {
        return ctx.forbidden("You don't have access to this progress record");
      }
    }

    return await super.findOne(ctx);
  },

  // Only Student may create — always forced to themselves.
  async create(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name !== 'Student') {
      return ctx.forbidden('Only Student may create progress records');
    }

    const body = ctx.request.body?.data || {};
    if (!body.lesson) {
      return ctx.badRequest('lesson is required');
    }

    const entry = await strapi.documents('api::lesson-progress.lesson-progress').create({
      data: {
        student: user.id,
        lesson: body.lesson,
        completed: body.completed ?? false,
        completedAt: body.completed ? new Date().toISOString() : undefined,
      },
      populate: ['student', 'lesson'],
    });

    ctx.body = { data: entry };
  },

  // Only Student may update — only their own record.
  async update(ctx) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (fullUser?.role?.name !== 'Student') {
      return ctx.forbidden('Only Student may update progress records');
    }

    const { id } = ctx.params;
    const idWhereClause =
      typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

    const existing = await strapi.query('api::lesson-progress.lesson-progress').findOne({
      where: idWhereClause,
      populate: ['student'],
    });

    if (!existing || existing.student?.id !== user.id) {
      return ctx.forbidden("You don't have access to this progress record");
    }

    const body = ctx.request.body?.data || {};
    if (body.completed === true && !body.completedAt) {
      ctx.request.body.data.completedAt = new Date().toISOString();
    }

    return await super.update(ctx);
  },
}));