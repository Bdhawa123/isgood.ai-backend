const ImpactService = {
  getImpacts(db, id) {
    return db
      .select("id", "description")
      .from("impact")
      .where("project_id", id);
  },
  updateImpacts(knex, projectId, impactId, newImpact) {
    return knex("impact")
      .where({
        id: impactId,
        project_id: projectId,
      })
      .update(newImpact)
      .returning("*")
      .then((rows) => rows[0]);
  },
  createImpact(knex, newImpacts) {
    return knex("impact").insert(newImpacts, ["*"]);
  },
  deleteImpact(knex, id) {
    return knex("impact").where({ id }).delete();
  },
};

module.exports = ImpactService;
