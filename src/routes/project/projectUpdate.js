const express = require('express')
const xss = require('xss')
const axios = require('axios')
const ProjectService = require('../../services/project-service')
const RoleService = require('../../services/role-service')

 const updateProject = async (req, res, next) => {
    const userId = req.user.sub
    const {name, description, projectImpacts, outcomesDesired, startDate, endDate, coordinates } = req.body

    try{
        const projectToUpdate = {
            name,
            description,
            start_date: startDate,
            end_date: endDate
        }
    
        const updatedProject = await ProjectService.updateProject(
            req.app.get('db'),
            req.params.projectId,
            projectToUpdate
        )

        const impactPromises = []
        for (let i = 0; i < projectImpacts.length; i++) {
            if(!projectImpacts[i].description || projectImpacts[i].description.length === 0) {
                return res.status(400).json({
                    error: {message: `Impact description required`}
                })
            }
            let newImpact = {
                description: projectImpacts[i].description
            }
            impactPromises.push(ProjectService.updateImpacts(
                req.app.get('db'),
                req.params.projectId,
                projectImpacts[i].id,
                newImpact
            ))    
        }
        const impacts = await Promise.all(impactPromises)
        console.log(impacts)

        const outcomePromises = []
        for (let j = 0; j < outcomesDesired.length; j++) {
            if(!outcomesDesired[j].description || outcomesDesired[j].description.length === 0) {
                return res.status(400).json({
                    error: {message: `Outcome description required`}
                })
            }
            let newOutcome = {
                description: outcomesDesired[j].description
            }
            outcomePromises.push(ProjectService.updateOutcomes(
                req.app.get('db'),
                req.params.projectId,
                outcomesDesired[j].id,
                newOutcome
            )) 
        }
        const outcomes = await Promise.all(outcomePromises)


        updatedProject.impacts = impacts
        updatedProject.outcomes = outcomes
        res.status(200).json(updatedProject)
    } catch(err) {
        next(err)
    }
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
    checkProjectExists,
    updateProject
}