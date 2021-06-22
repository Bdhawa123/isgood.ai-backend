const xss = require("xss");

const OrgService = {
  createOrg(db, newOrg) {
    return db
      .insert(newOrg)
      .into("org")
      .returning([
        "id",
        "updated_at",
        "name",
        "url",
        "plan",
        "description",
        "handle",
        "region",
        "sector",
      ])
      .then(([org]) => org);
  },
  createOrgUser(db, orgUserInfo) {
    return db
      .insert(orgUserInfo)
      .into("org_user")
      .returning("*")
      .then(([org_user]) => org_user);
  },
  checkOrgForUser(knex, userId, orgId) {
    return knex("org_user")
      .select("*")
      .where({
        user_id: userId,
        org_id: orgId,
      })
      .first();
  },
  getOrgIdBasedOnUser(knex, userId) {
    return knex("org_user")
      .select("*")
      .where("user_id", userId)
      .join("roles", "roles.id", "=", "org_user.role_id")
      .select("org_user.org_id", "roles.name");
  },
  getOrgs(db, orgId) {
    return db
      .select(
        "id",
        "updated_at",
        "name",
        "url",
        "plan",
        "description",
        "handle",
        "region",
        "sector"
      )
      .from("org")
      .whereIn("id", orgId)
      .groupBy("id")
      .having("status", "=", "true");
  },
  getByOrgId(knex, orgId) {
    return knex("org")
      .select("*")
      .where({
        id: orgId,
      })
      .first();
  },
  setOrgStatusInactive(knex, orgId, newStatus) {
    return knex("org").where("id", orgId).update(newStatus);
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
  setProjectStatusToInactive(knex, orgId, newProjectsFields) {
    return knex("project").where("org_id", orgId).update(newProjectsFields);
  },
};

module.exports = OrgService;
