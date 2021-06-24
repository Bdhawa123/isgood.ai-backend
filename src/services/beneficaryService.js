const REGEX_MUST_CONTAIN = /(?=.*[(><=)])+/;

const REGEX_AGE = /(?=.*[0-120])+/;
const BeneficiaryService = {
  validateNameOperatorValue(name, operator, value) {
    if (!name) {
      return "name is required";
    }
    if (!operator) {
      return "operator is required";
    }
    if (!value) {
      return "value is required";
    }
    if (name.toLowerCase() === "age" || name.toLowerCase() === "gender") {
      if (name.toLowerCase() === "age") {
        if (!REGEX_AGE.test(value)) {
          return `${value} is out of range`;
        }
        if (!REGEX_MUST_CONTAIN.test(operator)) {
          return `operator must contain <, >, <=, >=, or =`;
        }
        return null;
      }
      if (name.toLowerCase() === "gender") {
        if (
          value.toLowerCase() === "male" ||
          value.toLowerCase() === "female" ||
          value.toLowerCase() === "other"
        ) {
          return null;
        }
        return "value must contain either male, female, or other";
      }
    } else {
      return "name must be age or gender";
    }
  },
  getBeneficiaries(db, id) {
    return db
      .select("id", "description")
      .from("beneficiary")
      .where("project_id", id);
  },
  updateBeneficiaries(knex, beneficiaryId, newBeneficiary) {
    return knex("beneficiary")
      .where({
        beneficiary_id: beneficiaryId,
      })
      .update(newBeneficiary)
      .returning(["beneficiary_id", "name"])
      .then((rows) => rows[0]);
  },
  createBeneficiary(knex, newBeneficiaries) {
    return knex("beneficiary").insert(newBeneficiaries, ["*"]);
  },
  deleteBeneficiary(knex, id) {
    return knex("beneficiary").where({ beneficiary_id: id }).delete();
  },
  getLifeChanges(db, beneficiaryId) {
    return db
      .select("life_change_id", "description")
      .from("life_change")
      .where("beneficiary_id", beneficiaryId);
  },
  updateLifeChange(knex, lifeChangeId, newLifeChange) {
    return knex("life_change")
      .where({
        life_change_id: lifeChangeId,
      })
      .update(newLifeChange)
      .returning(["life_change_id", "description"])
      .then((rows) => rows[0]);
  },
  createLifeChange(knex, newLifeChange) {
    return knex("life_change").insert(newLifeChange, ["*"]);
  },
  deleteLifeChange(knex, lifeChangeId) {
    return knex("life_change")
      .where({
        life_change_id: lifeChangeId,
      })
      .delete();
  },
  getDemographics(db, beneficiaryId) {
    return db
      .select("demographic_id", "name", "operator", "value")
      .from("demographic")
      .where("beneficiary_id", beneficiaryId);
  },
  updateDemographic(knex, demographicId, newDemographic) {
    return knex("demographic")
      .where({
        demographic_id: demographicId,
      })
      .update(newDemographic)
      .returning(["demographic_id", "name", "operator", "value"])
      .then((rows) => rows[0]);
  },
  createDemographic(knex, newDemographic) {
    return knex("demographic").insert(newDemographic, ["*"]);
  },
  deleteDemographic(knex, demographicId) {
    return knex("demographic")
      .where({
        demographic_id: demographicId,
      })
      .delete();
  },
};

module.exports = BeneficiaryService;