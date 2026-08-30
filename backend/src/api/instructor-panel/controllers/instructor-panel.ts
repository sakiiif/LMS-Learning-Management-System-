export default {
  async myCourses(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const allCourses = await strapi.query('api::course.course').findMany({
      populate: ['instructors'],
    });

    const myCourses = allCourses.filter(
      (c: any) =>
        c.publishedAt !== null && // only published rows, skip drafts
        c.instructors?.some((i: any) => i.id === user.id)
    );

    ctx.body = {
      data: myCourses.map((c: any) => ({
        id: c.id,
        documentId: c.documentId,
        title: c.title,
        description: c.description,
      })),
    };
  },
};