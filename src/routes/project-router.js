const express = require('express')
const xss = require('xss')
const axios = require('axios')
const ProjectService = require('../services/project-service')
const AuthService = require('../services/auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const projectRouter = express.Router()
const jsonBodyParser = express.json()


  

projectRouter
    
    .get('/', requireAuth, jsonBodyParser, (req, res, next) => {
        //Get userId
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.status(401)
        const userId = AuthService.verifyJwt(token).userId

        ProjectService.getProjectIdBasedOnUser(
            req.app.get('db'),
            userId
        )
            .then(projectUser => {
                if(!projectUser) {
                    return res.status(400).json({
                        error: `No Projects` 
                    })
                }
                const projectIds = projectUser.map(item => item.projectId)
                ProjectService.getProjects(
                    req.app.get('db'),
                    projectIds
                )
                    .then(projects => {
                        res.status(200)
                        .json(projects)
                    })
            })
            .catch(next)
 
    })

    .post('/create', requireAuth, jsonBodyParser, (req, res, next) => {
            //Get userId
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        
        if (token == null) return res.status(401)
        
        const userId = AuthService.verifyJwt(token).userId
        
            //deconstruct req.body
        const {name, description, projectImpacts, outcomesDesired, orgId } = req.body
        

            //construct newProject
        const newProject = {
            name: xss(name), 
            description: xss(description),
            orgId: orgId
        }

            //reconstruct projectObject to create string
        let theObj = {
            name: xss(name), 
            description: xss(description),
            projectImpacts: xss(projectImpacts),
            outcomesDesired: xss(outcomesDesired)
        }
            //Stringify projectObject to pass to DS side
        let theString = ""
        for (let i in theObj) {
            theString += i + ":" + theObj[i] + ", "
        }
    
        

            //make sure the fields are not empty
        for (const field of ['name', 'description', 'projectImpacts', 'outcomesDesired', 'orgId'])
        if (!req.body[field])
            return res.status(400).json({
                error: `Missing '${field}' in request body`
            })
        
            //create project table
            ProjectService.createProject (
            req.app.get('db'),
            newProject
        )
            .then(project => {
                    //once project is created.. create impact entry with projectId as FK
                let newImpacts = []
                projectImpacts.map(impact => {
                    newImpacts.push({
                        "projectId": project.projectId, 
                        "description": xss(impact)
                    })
                })
    
                ProjectService.createImpact(
                    req.app.get('db'),
                    newImpacts
                )
                //once impacts are created.. insert projectOutcomes in outcome table
                    .then(impacts => {
                        let newOutcomes = []
                        outcomesDesired.map(outcome => {
                            newOutcomes.push({
                                "projectId": project.projectId, 
                                "description": xss(outcome)
                            })
                        })
                        ProjectService.createOutcome(
                            req.app.get('db'),
                            newOutcomes
                        )
                                // once outcomes are created.. create userProject table
                            .then(outcomes => {
                                ProjectService.createProjectUser(
                                    req.app.get('db'),
                                    {
                                        projectId: project.projectId,
                                        userId: userId

                                    }
                                )
                                    .then(projectUser => {
                                            //send project to DS to get the indicators to the project
                                        getIndicators(project.projectId, theString)
                                    })
                            })
                    })
            })
            .catch(next)

            function getIndicators(projectId, theString) {
                    //Will be a post request but the endpoint is not functioning yet. Using jsonServer for now to create dummy data
                axios.get('http://localhost:9090/projectIndicators') 
                    .then(indicators => {
                        let concatIndicators = []
                        indicators.data.map(indicator => {
                            concatIndicators.push({
                                "projectId": projectId, 
                                "indicatorId": indicator.indicatorId,
                                "alignedStrength": indicator.alignedStrength
                            })
                        })
                        ProjectService.createIndicators(
                            req.app.get('db'),
                            concatIndicators
                        )
                        .then(setIndicators => {
                            res.status(201)
                            .end()
                        })
                    }).catch(next)
            }
    })

    

                ///////////////////might use this is code in a PATCH request to add beneficiaries, demographics, geolocation, startDate, and endDate ///////////////////

    // .then(projectUser => {
    //         const newBeneficiaries = []
    //         beneficiaries.map(beneficiary => {
    //             newBeneficiaries.push({
    //                 "projectId": project.projectId, 
    //                 "name": xss(beneficiary.name), 
    //                 "lifeChange": xss(beneficiary.lifeChange)
    //             })
    //         })
    //         ProjectService.createBeneficiaries(
    //             req.app.get('db'),
    //             newBeneficiaries
    //         )
    //                 //insert demographics into demographic table
    //             .then(beneficiaryRes => {
    //                 let newDemographics = []
    //                 for(let i = 0; i < beneficiaries.length; i++) {
    //                     if (beneficiaries[i].demographics) {
    //                         for(let j = 0; j < beneficiaries[i].demographics.length; j++) {
    //                                 if (!beneficiaries[i].demographics[j].name || !beneficiaries[i].demographics[j].operator || !beneficiaries[i].demographics[j].value) {
    //                                     return res.status(400).json({
    //                                         error: `Name, operator, and value required in demographics request body`
    //                                     })
    //                                 } else {
    //                                     newDemographics.push({
    //                                         "beneficiaryId": beneficiaryRes[i].beneficiaryId,
    //                                         "name": xss(beneficiaries[i].demographics[j].name),
    //                                         "operator": xss(beneficiaries[i].demographics[j].operator),
    //                                         "value": xss(beneficiaries[i].demographics[j].value)
    //                                     })
    //                                 }
                                
    //                         }
    //                     }
    //                 }
    //                 ProjectService.createDemographics(
    //                     req.app.get('db'),
    //                     newDemographics
    //                 )
    //                     .then(demographics => {
    //                             // All is well return the project. To get beneficiaries and demographics client will have to make a GET request
    //                         res.status(201)
    //                         .json({
    //                             projectId: project.projectId, 
    //                             role: projectUser.role,
    //                             name: xss(name), 
    //                             description: xss(description),
    //                             orgId: orgId,
    //                             projectImpacts: xss(projectImpacts),
    //                             outcomesDesired: xss(outcomesDesired),
    //                             geolocation: xss(geolocation),
    //                             startDate: startDate,
    //                             endDate: endDate
    //                         })
    //                     })
    //             })
        
    // }).catch(next)


    

 



module.exports = projectRouter
