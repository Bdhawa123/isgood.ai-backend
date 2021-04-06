const ProjectService = {
    createProject(db, newProject) {
        return db
        .insert(newProject)
        .into('project')
        .returning('*')
        .then(([project]) => project)
    },
    createImpact(knex, newImpacts) {
        return knex('impact')
        .insert(newImpacts, ["*"])
    },
    createOutcome(knex, newOutcomes) {
        return knex('outcome')
        .insert(newOutcomes, ["*"])
    },
    createBeneficiaries(knex, newBeneficiaries) {
        return knex('beneficiary')
        .insert(newBeneficiaries, ["*"])
    },
    createDemographics(knex, newDemographics) {
        return knex('demographic')
        .insert(newDemographics, ["*"])
    }
}

module.exports = ProjectService