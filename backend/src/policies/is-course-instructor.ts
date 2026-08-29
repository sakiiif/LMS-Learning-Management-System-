// src/policies/is-course-instructor.ts

export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
    where: { id: user.id },
    populate: ['role'],
  });

  const roleName = fullUser?.role?.name;

  if (roleName === 'Admin' || roleName === 'Content Manager') {
    return true;
  }

  if (roleName !== 'Instructor') {
    return false;
  }

  const { id } = policyContext.params;
  const contentTypeUid = config.contentType;

  let courseId: number | string | undefined;

  if (id) {
    // id from the URL is a documentId (string) in Strapi v5 — detect and
    // query accordingly, same pattern as the course lookup below.
    const idWhereClause =
      typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

    const existing = await strapi.query(contentTypeUid).findOne({
      where: idWhereClause,
      populate: ['course'],
    });
    courseId = existing?.course?.id;
  } else {
    courseId = policyContext.request.body?.data?.course ?? policyContext.request.body?.course;
  }

  if (!courseId) return false;

  const courseWhereClause =
    typeof courseId === 'string' && isNaN(Number(courseId))
      ? { documentId: courseId }
      : { id: courseId };

  const course = await strapi.query('api::course.course').findOne({
    where: courseWhereClause,
    populate: ['instructors'], // adjust casing to match whatever you settled on
  });

  if (!course) return false;

  return !!course.instructors?.some((i: any) => i.id === user.id);
};