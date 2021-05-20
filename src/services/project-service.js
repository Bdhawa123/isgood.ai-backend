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
        .into('project_user')
        .returning('*')
        .then(([project_user]) => project_user)
    },
    getProjectIdBasedOnUser(knex, userId) {
        return knex('project_user')
        .select('*')
        .where('user_id', userId)
    },
    getProjects(db, projectId) {
        return db
        .select('project_id', 'name', 'description')
        .from('project')
        .whereIn('project_id', projectId)
    },
    checkProjectForUser(knex, userId, projectId) {
        return knex('project_user')
            .select('*')
            .where({
                'user_id': userId,
                'project_id': projectId
            })
    },
    getById(knex, id) {
        return knex('project')
            .select('*')
            .where({
            // 'user_id': userId,
            'project_id': id
        }).first()
    }
}

module.exports = ProjectService