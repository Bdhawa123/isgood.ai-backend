const IndicatorService = {
  getIndicators(db, projectId) {
    return db
      .select("indicator_id", "aligned_strength")
      .from("indicator")
      .where({ project_id: projectId });
  },
  createIndicators(knex, indicators) {
    return knex("indicator").insert(indicators, ["*"]);
  },
  getProjectById(knex, id) {
    return knex("project")
      .select("name", "description")
      .where({
        project_id: id,
      })
      .first();
  },
};

module.exports = IndicatorService;
