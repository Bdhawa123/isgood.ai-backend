const OutcomeService = {
  getOutcomes(db, id) {
    return db
      .select("id", "description")
      .from("outcome")
      .where("project_id", id);
  },
  updateOutcomes(knex, projectId, outcomeId, newOutcome) {
    return knex("outcome")
      .where({
        id: outcomeId,
        project_id: projectId,
      })
      .update(newOutcome)
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  createOutcome(knex, newOutcomes) {
    return knex("outcome").insert(newOutcomes, ["*"]);
  },
  deleteOutcome(knex, id) {
    return knex("outcome").where({ id }).delete();
  },
};

module.exports = OutcomeService;
