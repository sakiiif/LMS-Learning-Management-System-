// src/api/admin-panel/controllers/admin-panel.ts

const ASSIGNABLE_ROLES = ['Admin', 'Content Manager', 'Instructor', 'Student'];

export default {
  // GET /admin-panel/users — list all users with their roles
  async listUsers(ctx: any) {
    const users = await strapi.query('plugin::users-permissions.user').findMany({
      populate: ['role'],
      select: ['id', 'username', 'email', 'fullName', 'confirmed', 'blocked', 'createdAt'],
    });
    ctx.body = { data: users };
  },

    // POST /admin-panel/users — Admin creates a new user with a specified role
    async createUser(ctx: any) {
    const { username, email, password, fullName, role } = ctx.request.body;

    if (!username || !email || !password || !role) {
        return ctx.badRequest('username, email, password, and role are required');
    }

    if (!ASSIGNABLE_ROLES.includes(role)) {
        return ctx.badRequest(`role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`);
    }

    const normalizedEmail = email.toLowerCase(); // <-- add this

    // Check for existing username or email (case-insensitive on email,
    // matching Strapi's own default register behavior)
    const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
        $or: [
            { username },
            { email: normalizedEmail }, // normaliozed
        ],
        },
    });

    if (existingUser) {
        if (existingUser.username === username) {
        return ctx.badRequest('Username is already taken');
        }
        return ctx.badRequest('Email is already taken');
    }

    const targetRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { name: { $eqi: role } } });

    if (!targetRole) {
        return ctx.badRequest(`Role "${role}" does not exist`);
    }

    const newUser = await strapi.plugin('users-permissions').service('user').add({
        username,
        email: normalizedEmail, // use normalized
        password,
        fullName,
        role: targetRole.id,
        confirmed: true,
        provider: 'local',
    });

    ctx.body = {
        data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: { id: targetRole.id, name: targetRole.name },
        },
    };
    },

  // PUT /admin-panel/users/:id/role — Admin changes an existing user's role
  async updateUserRole(ctx: any) {
    const { id } = ctx.params;
    const { role } = ctx.request.body;

    if (!role || !ASSIGNABLE_ROLES.includes(role)) {
      return ctx.badRequest(`role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`);
    }

    const targetRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: { $eqi: role } } });

    if (!targetRole) {
      return ctx.badRequest(`Role "${role}" does not exist`);
    }

    const existingUser = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { id } });

    if (!existingUser) {
      return ctx.notFound('User not found');
    }

    const updatedUser = await strapi.query('plugin::users-permissions.user').update({
      where: { id },
      data: { role: targetRole.id },
    });

    ctx.body = {
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: { id: targetRole.id, name: targetRole.name },
      },
    };
  },

  // GET /admin-panel/stats — basic platform stats for the admin dashboard
  async getStats(ctx: any) {
    const [totalUsers, allCourses, totalEnrollments] = await Promise.all([
      strapi.query('plugin::users-permissions.user').count(),
      strapi.query('api::course.course').findMany({ where: { publishedAt: { $notNull: true } } }),
      strapi.query('api::enrollment.enrollment').count(),
    ]);

    const totalCourses = allCourses.length;

    const roles = await strapi.query('plugin::users-permissions.role').findMany();
    const usersPerRole: Record<string, number> = {};
    for (const r of roles) {
      usersPerRole[r.name] = await strapi
        .query('plugin::users-permissions.user')
        .count({ where: { role: r.id } });
    }

    ctx.body = {
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        usersPerRole,
      },
    };
  },

    // DELETE /admin-panel/users/:id — Admin deletes a user account
    async deleteUser(ctx: any) {
    const { id } = ctx.params;

    const existingUser = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { id } });

    if (!existingUser) {
        return ctx.notFound('User not found');
    }

    // Prevent an Admin from deleting their own account through this
    // endpoint — avoids accidentally locking themselves out.
    if (String(existingUser.id) === String(ctx.state.user.id)) {
        return ctx.badRequest('You cannot delete your own account');
    }

    await strapi.query('plugin::users-permissions.user').delete({
        where: { id },
    });

    ctx.body = { data: { id, deleted: true } };
    },

  // assign instructors by the admin or content manager only
  async addInstructor(ctx: any) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });
    const roleName = fullUser?.role?.name;

    if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('Only Admin or Content Manager may assign instructors');
    }

    const { id } = ctx.params;
    const { instructorId } = ctx.request.body;

    if (!instructorId) {
      return ctx.badRequest('instructorId is required');
    }

    const idWhereClause =
      typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

    const course = await strapi.query('api::course.course').findOne({
      where: idWhereClause,
      populate: ['instructors'],
    });
    if (!course) return ctx.notFound('Course not found');

    const alreadyAssigned = course.instructors?.some((i: any) => i.id === instructorId);
    if (alreadyAssigned) {
      return ctx.badRequest('This instructor is already assigned to this course');
    }

    const targetUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: instructorId },
      populate: ['role'],
    });
    if (!targetUser || targetUser.role?.name !== 'Instructor') {
      return ctx.badRequest('Target user is not an Instructor');
    }

    const currentIds = (course.instructors || []).map((i: any) => i.id);
    const updatedIds = [...currentIds, instructorId];

    await strapi.documents('api::course.course').update({
      documentId: course.documentId,
      data: { instructors: updatedIds },
      status: 'published', //  direct publishing on update
    });

    ctx.body = { data: { success: true } };
  },

  // remove instructors by the admin or content manager only
  async removeInstructor(ctx: any) {
    const user = ctx.state.user;
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });
    const roleName = fullUser?.role?.name;

    if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('Only Admin or Content Manager may remove instructors');
    }

    const { id, instructorId } = ctx.params;

    const idWhereClause =
      typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id };

    const course = await strapi.query('api::course.course').findOne({
      where: idWhereClause,
      populate: ['instructors'],
    });
    if (!course) return ctx.notFound('Course not found');

    const updatedIds = (course.instructors || [])
      .map((i: any) => i.id)
      .filter((existingId: number) => String(existingId) !== String(instructorId));

    await strapi.documents('api::course.course').update({
      documentId: course.documentId,
      data: { instructors: updatedIds },
      status: 'published', // direct publishing on update
    });

    ctx.body = { data: { success: true } };
  },
  
  // fetch all course data
  async allCoursesWithInstructors(ctx: any) {
    const allCourses = await strapi.query('api::course.course').findMany({
      where: { publishedAt: { $notNull: true } },
      populate: ['instructors'],
    });

    ctx.body = {
      data: allCourses.map((c: any) => ({
        id: c.id,
        documentId: c.documentId,
        title: c.title,
        description: c.description,
        instructors: (c.instructors || []).map((i: any) => ({
          id: i.id,
          username: i.username,
          fullName: i.fullName,
        })),
      })),
    };
  },
};