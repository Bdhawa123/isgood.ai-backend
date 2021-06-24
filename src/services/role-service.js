const RoleService = {
  getByName(knex, name) {
    return knex("roles")
      .select("*")
      .where({
        name: name,
      })
      .first();
  },
  getOrgRoleId(knex, orgId, userId) {
    return knex
      .select("role_id")
      .from("org_user")
      .where({
        org_id: orgId,
        user_id: userId,
      })
      .then((rows) => {
        return rows[0];
      });
  },
  getProjectRoleId(knex, projectId, userId) {
    return knex
      .select("role_id")
      .from("project_user")
      .where({
        project_id: projectId,
        user_id: userId,
      })
      .then((rows) => {
        return rows[0];
      });
  },
  getRoles(db, orgId) {
    return db
      .select("id", "name", "url", "description", "handle", "region", "sector")
      .from("org")
      .whereIn("id", orgId);
  },
};

const getOrgRole = async (knex, orgId, userId) => {
  try {
    const roleId = await RoleService.getOrgRoleId(knex, orgId, userId);
    return knex
      .select("name")
      .from("roles")
      .where("id", roleId.role_id)
      .then((rows) => {
        return rows[0];
      });
  } catch (err) {
    throw Error(err.message);
  }
};

const getProjectRole = async (knex, projectId, userId) => {
  try {
    const roleId = await RoleService.getProjectRoleId(knex, projectId, userId);
    return knex
      .select("name")
      .from("roles")
      .where("id", roleId.role_id)
      .then((rows) => {
        return rows[0];
      });
  } catch (err) {
    throw Error(err.message);
  }
};

module.exports = {
  RoleService,
  getOrgRole,
  getProjectRole,
};
