// src/policies/is-admin.ts

export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false; // not logged in at all
  }

  // Make sure role is populated — ctx.state.user sometimes only has role.id
  const fullUser = await strapi
    .query('plugin::users-permissions.user')
    .findOne({ where: { id: user.id }, populate: ['role'] });

  if (!fullUser?.role || fullUser.role.name !== 'Admin') {
    return false;
  }

  return true;
};