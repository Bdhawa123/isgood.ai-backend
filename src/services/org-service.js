const xss = require("xss");

const OrgService = {
  createOrg(db, newOrg) {
    return db
      .insert(newOrg)
      .into("org")
      .returning("*")
      .then(([org]) => org);
  },
  createOrgUser(db, orgUserInfo) {
    return db
      .insert(orgUserInfo)
      .into("org_user")
      .returning("*")
      .then(([org_user]) => org_user);
  },
  getOrgIdBasedOnUser(knex, userId) {
    return knex("org_user")
      .select("*")
      .where("user_id", userId)
      .join("roles", "roles.id", "=", "org_user.role_id")
      .select("org_user.org_id", "org_user.status", "roles.name");
  },
  getOrgs(db, orgId) {
    return db.select("*").from("org").whereIn("org_id", orgId);
  },
  getByOrgId(knex, orgId) {
    return knex("org")
      .select("*")
      .where({
        org_id: orgId,
      })
      .first();
  },
  serializeOrg(org) {
    return {
      orgId: org.id,
      name: xss(org.name),
      url: xss(org.url),
      plan: org.plan,
      plan_status: org.planStatus,
    };
  },
};

module.exports = OrgService;
