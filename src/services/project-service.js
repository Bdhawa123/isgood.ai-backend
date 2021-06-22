const ProjectService = {
  createProject(db, newProject) {
    return db
      .insert(newProject)
      .into("project")
      .returning(["id", "name", "updated_at", "description", "org_id"])
      .then(([project]) => project);
  },
  createIndicatorCurrent(db, projectId) {
    return db
      .insert(projectId)
      .into("indicator_current")
      .returning("*")
      .then(([current]) => current);
  },
  createIndicators(knex, indicators) {
    return knex("indicator").insert(indicators, ["*"]);
  },
  createLifeChange(knex, lifeChanges) {
    return knex("life_change").insert(lifeChanges, ["*"]);
  },
  createBeneficiaries(knex, newBeneficiaries) {
    return knex("beneficiary").insert(newBeneficiaries, ["*"]);
  },
  createDemographics(knex, newDemographics) {
    return knex("demographic").insert(newDemographics, ["*"]);
  },
  getBeneficiaries(db, projectId) {
    return db
      .select("id", "name")
      .from("beneficiary")
      .where("project_id", projectId);
  },
  getDemographics(db, beneficiaryId) {
    return db
      .select("id", "beneficiary_id", "name", "operator", "value")
      .from("demographic")
      .whereIn("beneficiary_id", beneficiaryId);
  },
  getLifeChange(db, beneficiaryId) {
    return db
      .select("id", "beneficiary_id", "description")
      .from("life_change")
      .whereIn("beneficiary_id", beneficiaryId);
  },
  createProjectUser(db, projectUserInfo) {
    return db
      .insert(projectUserInfo)
      .into("project_user")
      .returning("*")
      .then(([project_user]) => project_user);
  },
  getProjectIdBasedOnUser(knex, userId) {
    return knex("project_user")
      .select("*")
      .where("user_id", userId)
      .join("roles", "roles.id", "=", "project_user.role_id")
      .select("project_user.project_id", "roles.name");
  },
  getProjectIdFromProjectUser(knex, userId, orgId) {
    return knex("project_user")
      .select("*")
      .where({ user_id: userId, org_id: orgId })
      .join("roles", "roles.id", "=", "project_user.role_id")
      .select("project_user.project_id", "roles.name")
      .then((rows) => {
        return rows[0];
      });
  },
  getProjects(db, projectId) {
    return db
      .select("id", "name", "updated_at", "description", "org_id")
      .from("project")
      .whereIn("id", projectId)
      .groupBy("id")
      .having("status", "=", "true");
  },
  getProjectsByOrgId(db, orgId) {
    return db
      .select("id", "name", "updated_at", "description", "org_id")
      .from("project")
      .whereIn("org_id", orgId)
      .groupBy("id")
      .having("status", "=", "true");
  },
  checkProjectForUser(knex, userId, projectId) {
    return knex("project_user")
      .select("*")
      .where({
        user_id: userId,
        project_id: projectId,
      })
      .first();
  },
  getById(knex, id) {
    return knex("project")
      .select(
        "id",
        "name",
        "updated_at",
        "description",
        "geolocation",
        "start_date",
        "end_date",
        "org_id"
      )
      .where({
        id,
        status: true,
      })
      .first();
  },
  getIndicatorStatus(db, projectId) {
    return db
      .select("up_to_date")
      .from("indicator_current")
      .where({ project_id: projectId })
      .first();
  },
  getIndicators(db, projectId) {
    return db.select("*").from("indicator").where({ project_id: projectId });
  },
  updateProject(knex, projectId, newProjectsFields) {
    return knex("project")
      .where("id", projectId)
      .update(newProjectsFields)
      .returning([
        "id",
        "name",
        "description",
        "geolocation",
        "start_date",
        "end_date",
        "org_id",
      ])
      .then((rows) => {
        return rows[0];
      });
  },
  setProjectStatusToInactive(knex, projectId, newProjectsFields) {
    return knex("project")
      .where("id", projectId)
      .update(newProjectsFields)
      .returning([
        "id",
        "name",
        "description",
        "geolocation",
        "start_date",
        "end_date",
        "org_id",
      ])
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = ProjectService;
