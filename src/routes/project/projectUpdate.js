const express = require('express')
const xss = require('xss')
const axios = require('axios')
const ProjectService = require('../../services/project-service')
const RoleService = require('../../services/role-service')

function updateProject(req, res, next) {
    const userId = req.user.sub
    const {name, description, projectImpacts, outcomesDesired, beneficiaries, startDate, endDate, coordinates } = req.body

            //make sure the fields are not empty
        //  for (const field of ['name', 'description', 'projectImpacts', 'outcomesDesired', 'orgId'])
        //  if (!req.body[field])
        //      return res.status(400).json({
        //          error: {message: `Missing '${field}' in request body`}
        //      })

    const projectToUpdate = {
        name,
        description,
        project_impacts: projectImpacts,
        outcomes_desired: outcomesDesired,
        start_date: startDate,
        end_date: endDate
    }

    ProjectService.updateProject(
        req.app.get('db'),
        req.params.projectId,
        projectToUpdate
    )
        .then(project => {

        }).catch(next)


}

function checkProjectExists(req, res, next) {
    const projectId = req.params.projectId
    const userId = req.user.sub

    ProjectService.checkProjectForUser(
        req.app.get('db'),
        userId,
        projectId
    )
        .then(metaUserProjectInfo => {
            if(!metaUserProjectInfo) {
                return res.status(400).json({
                    error: {message: `No Projects`} 
                })
            } else {
                req.metaUserProjectInfo = metaUserProjectInfo
                next()
            }
        }).catch(next)

}

module.exports = {
    updateProject
}