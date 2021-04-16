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
    createIndicators(knex, indicators) {
        return knex('indicator')
        .insert(indicators, ["*"])
    },
    createBeneficiaries(knex, newBeneficiaries) {
        return knex('beneficiary')
        .insert(newBeneficiaries, ["*"])
    },
    createDemographics(knex, newDemographics) {
        return knex('demographic')
        .insert(newDemographics, ["*"])
    },
    createProjectUser(db, projectUserInfo) {
        return db   
        .insert(projectUserInfo)
        .into('projectUser')
        .returning('*')
        .then(([projectUser]) => projectUser)
    },
    getProjectIdBasedOnUser(knex, userId) {
        return knex('projectUser')
        .select('*')
        .where('userId', userId)
    },
    getProjects(db, projectId) {
        return db
        .select('*')
        .from('project')
        .whereIn('projectId', projectId)
    }
}

module.exports = ProjectService