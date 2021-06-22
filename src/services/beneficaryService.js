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
  updateBeneficiaries(knex, id, newBeneficiary) {
    return knex("beneficiary")
      .where({
        id,
      })
      .update(newBeneficiary)
      .returning(["id", "name"])
      .then((rows) => rows[0]);
  },
  createBeneficiary(knex, newBeneficiaries) {
    return knex("beneficiary").insert(newBeneficiaries, ["*"]);
  },
  deleteBeneficiary(knex, id) {
    return knex("beneficiary").where({ id }).delete();
  },
  getLifeChanges(db, beneficiaryId) {
    return db
      .select("id", "description")
      .from("life_change")
      .where("beneficiary_id", beneficiaryId);
  },
  updateLifeChange(knex, id, newLifeChange) {
    return knex("life_change")
      .where({
        id,
      })
      .update(newLifeChange)
      .returning(["id", "description"])
      .then((rows) => rows[0]);
  },
  createLifeChange(knex, newLifeChange) {
    return knex("life_change").insert(newLifeChange, ["*"]);
  },
  deleteLifeChange(knex, id) {
    return knex("life_change")
      .where({
        id,
      })
      .delete();
  },
  getDemographics(db, beneficiaryId) {
    return db
      .select("id", "name", "operator", "value")
      .from("demographic")
      .where("beneficiary_id", beneficiaryId);
  },
  updateDemographic(knex, id, newDemographic) {
    return knex("demographic")
      .where({
        id,
      })
      .update(newDemographic)
      .returning(["id", "name", "operator", "value"])
      .then((rows) => rows[0]);
  },
  createDemographic(knex, newDemographic) {
    return knex("demographic").insert(newDemographic, ["*"]);
  },
  deleteDemographic(knex, id) {
    return knex("demographic")
      .where({
        id,
      })
      .delete();
  },
};

module.exports = BeneficiaryService;
