const express = require('express')
const path = require('path')
const xss = require('xss')
const ProjectService = require('../services/project-service')
const AuthService = require('../services/auth-service')
const UsersService = require('../services/users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const projectRouter = express.Router()
const jsonBodyParser = express.json()

projectRouter
    .post('/create', jsonBodyParser, (req, res, next) => {
        
        const {name, description, projectImpacts, outcomesDesired, beneficiaries, geolocation, startDate, endDate, orgId } = req.body

        const newProject = {
            name: xss(name), 
            description: xss(description),
            orgId: orgId
        }
        

        console.log('test')
        ProjectService.createProject (
            req.app.get('db'),
            newProject
        )
            .then(project => {
                let newImpacts = []
                projectImpacts.map(impact => {{
                    newImpacts.push({"projectId": project.projectId, "description": impact})
                }})
                ProjectService.createImpact(
                    req.app.get('db'),
                    newImpacts
                )
                    .then(impacts => {
                        let newOutcomes = []
                        outcomesDesired.map(outcome => {
                            newOutcomes.push({"projectId": project.projectId, "description": outcome})
                        })
                        ProjectService.createOutcome(
                            req.app.get('db'),
                            newOutcomes
                        )
                            .then(outcomes => {
                                if(!beneficiaries) {
                                    res.status(201)
                                    .json({
                                        projectId: project.projectId, 
                                        name: xss(name), 
                                        description: xss(description),
                                        orgId: orgId,
                                        projectImpacts: projectImpacts,
                                        outcomesDesired: outcomesDesired
                                    })
                                }
                                const newBeneficiaries = []
                                beneficiaries.map(beneficiary => {
                                    newBeneficiaries.push(
                                        {
                                            "projectId": project.projectId, 
                                            "name": beneficiary.name, "lifeChange": beneficiary.lifeChange})
                                })
                                ProjectService.createBeneficiaries(
                                    req.app.get('db'),
                                    newBeneficiaries
                                )
                                    .then(beneficiaryRes => {
                                        let newDemographics = []
                                        for(let i = 0; i < beneficiaries.length; i++) {
                                            for(let j = 0; j < beneficiaries[i].demographics.length; j++) {
                                                newDemographics.push({
                                                    "beneficiaryId": beneficiaryRes[i].beneficiaryId,
                                                    "name": beneficiaries[i].demographics[j].name,
                                                    "operator": beneficiaries[i].demographics[j].operator,
                                                    "value": beneficiaries[i].demographics[j].value
                                                })
                                            }
                                        }
                                        ProjectService.createDemographics(
                                            req.app.get('db'),
                                            newDemographics
                                        )
                                            .then(demographics => {
                                                res.status(201)
                                                .json(demographics)
                                            })
                                    })
                            })
                        
                    })
            })
            .catch(next)
            // res.status(201)
            // .json(impacts)
    })



module.exports = projectRouter

// project = {
//     name: "test",
//     description: "dxftdkrxghijoih'ug;yflhkt",
//     projectImpacts: ["ertvwerb eb", "evwevweveq", "efvweveqveqv"],
//     outcomesDesired: ["fvwevrvwvt", "efvwevwqvq", "ervewvrvw"],
//     beneficiaries: [
        // {
        //    name: "ljhvkv",
        //    change: ",jh kgvj",
        //    demographics: [
        //        {
        //            type: "age",
        //            operator: ">",
        //            value: "10"
        //        },
        //    ] 
        // },
//     ],
//     geolocation: ["ervweqv", "vevewveq"],
//     startDate: "timestamp",
//     endDate: "timestamp"

// }