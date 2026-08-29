// src/policies/is-quiz-course-instructor.ts

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

  const { id } = policyContext.params; // Question's id/documentId, on update/delete
  const contentTypeUid = config.contentType; // 'api::question.question'

  let quizId: number | string | undefined;

  if (id) {
    // update/delete — look up the existing Question's quiz relation
    const idWhereClause =
      typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

    const existingQuestion = await strapi.query(contentTypeUid).findOne({
      where: idWhereClause,
      populate: ['quiz'],
    });
    quizId = existingQuestion?.quiz?.id;
  } else {
    // create — quiz should be in the request body
    quizId = policyContext.request.body?.data?.quiz ?? policyContext.request.body?.quiz;
  }

  if (!quizId) return false;

  const quizWhereClause =
    typeof quizId === 'string' && isNaN(Number(quizId)) ? { documentId: quizId } : { id: quizId };

  // Fetch the Quiz, populated with its Course, populated with its Instructors
  const quiz = await strapi.query('api::quiz.quiz').findOne({
    where: quizWhereClause,
    populate: {
      course: {
        populate: ['instructors'], // match your actual field casing
      },
    },
  });

  if (!quiz?.course) return false;

  return !!quiz.course.instructors?.some((i: any) => i.id === user.id);
};