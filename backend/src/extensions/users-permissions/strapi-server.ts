// src/extensions/users-permissions/strapi-server.ts

export default (plugin: any) => {
  const originalAuthFactory = plugin.controllers.auth;

  plugin.controllers.auth = ({ strapi }: { strapi: any }) => {
    const originalAuth = originalAuthFactory({ strapi });
    const originalRegister = originalAuth.register;

    originalAuth.register = async (ctx: any) => {
      const { fullName } = ctx.request.body;
      const STUDENT_ROLE_NAME = 'student';

      // Look up the actual Student role record
      const studentRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { name: { $eqi: STUDENT_ROLE_NAME } } });

      if (!studentRole) {
        return ctx.badRequest(
          `Role "${STUDENT_ROLE_NAME}" does not exist. Create it in Settings first.`
        );
      }

      // Strip everything except username/email/password before handing off
      // to Strapi's built-in register — it rejects unknown fields like fullName.
      const { username, email, password } = ctx.request.body;
      ctx.request.body = { username, email, password };

      // Run Strapi's normal registration logic (creates user, hashes
      // password, issues JWT)
      await originalRegister(ctx);

      // If registration itself failed, ctx.body won't have a user — bail out
      if (!ctx.body || !ctx.body.user) {
        return;
      }

      const newUserId = ctx.body.user.id;

      // Reassign from default "Authenticated" to Student, save fullName
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: newUserId },
        data: {
          role: studentRole.id,
          ...(fullName ? { fullName } : {}),
        },
      });

      // Reflect the corrected role/name in the response
      ctx.body.user.role = { id: studentRole.id, name: studentRole.name };
      if (fullName) ctx.body.user.fullName = fullName;

      return ctx.body;
    };

    return originalAuth;
  };

  // --- Override me (user controller — NOT a factory, plain object) ---
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx: any) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });

    ctx.body = {
      id: fullUser.id,
      username: fullUser.username,
      email: fullUser.email,
      fullName: fullUser.fullName,
      confirmed: fullUser.confirmed,
      blocked: fullUser.blocked,
      role: fullUser.role ? { id: fullUser.role.id, name: fullUser.role.name } : null,
    };
  };

  return plugin;
};