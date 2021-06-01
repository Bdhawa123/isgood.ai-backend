const ProjectService = {
    createProject(db, newProject) {
        return db
        .insert(newProject)
        .into('project')
        .returning(['project_id', 'org_id'])
        .then(([project]) => project)
    },
    createIndicators(knex, indicators) {
        return knex('indicator')
        .insert(indicators, ["*"])
    },
    createLifeChange(knex, lifeChanges) {
        return knex('life_change')
        .insert(lifeChanges, ["*"])
    },
    createBeneficiaries(knex, newBeneficiaries) {
        return knex('beneficiary')
        .insert(newBeneficiaries, ["*"])
    },
    createDemographics(knex, newDemographics) {
        return knex('demographic')
        .insert(newDemographics, ["*"])
    },
    getBeneficiaries(db, projectId) {
        return db
        .select('beneficiary_id', 'name')
        .from('beneficiary')
        .where('project_id', projectId)
    },
    getDemographics(db, beneficiaryId) {
        return db
        .select('demographic_id', 'beneficiary_id', 'name', 'operator', 'value')
        .from('demographic')
        .whereIn('beneficiary_id', beneficiaryId)
    },
    getLifeChange(db, beneficiaryId) {
        return db
        .select('life_change_id', 'beneficiary_id', 'description')
        .from('life_change')
        .whereIn('beneficiary_id', beneficiaryId)
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
        .join('roles', 'roles.id', '=', 'project_user.role_id')
        .select('project_user.project_id', 'project_user.status', 'roles.name')
    },
    getProjects(db, projectId) {
        return db
        .select('project_id', 'name', 'description', 'org_id')
        .from('project')
        .whereIn('project_id', projectId)
    },
    checkProjectForUser(knex, userId, projectId) {
        return knex('project_user')
            .select('*')
            .where({
                'user_id': userId,
                'project_id': projectId
            }).first()
    },
    getById(knex, id) {
        return knex('project')
            .select('project_id', 'name', 'description', 'geolocation', 'start_date', 'end_date', 'org_id')
            .where({
            'project_id': id
        }).first()
    },
    getIndicators(db, projectId) {
        return db
        .select('*')
        .from('indicator')
        .where({'project_id': projectId})
    },
    updateProject(knex, projectId, newProjectsFields) {
        return knex('project')
            .where('project_id', projectId)
            .update(newProjectsFields)
            .returning(['project_id', 'name', 'description', 'geolocation', 'start_date', 'end_date', 'org_id'])
            .then(rows => {
                return rows[0]
            })
    },
}

module.exports = ProjectService