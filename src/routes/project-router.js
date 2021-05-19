const express = require('express')
const xss = require('xss')
const axios = require('axios')
const ProjectService = require('../services/project-service')
const RoleService = require('../services/role-service')
let Buffer = require('buffer/').Buffer
let jwtCheck = require('../middleware/oAuth')
const projectRouter = express.Router()
const jsonBodyParser = express.json()


  

projectRouter
    
    .get('/', jwtCheck, jsonBodyParser, (req, res, next) => {
        //Get userId
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
    
        if (token == null) return res.status(401)
        
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const userId = decoded.sub

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
                const projectIds = projectUser.map(item => item.project_id)
                console.log(projectIds)
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
projectRouter
    .get('/:projectId', jwtCheck, jsonBodyParser, (req, res, next) => {
        //Get userId
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
    
        if (token == null) return res.status(401)
        
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const userId = decoded.sub
        console.log(req.params.projectId)

        ProjectService.checkProjectForUser(
            req.app.get('db'),
            userId,
            req.params.projectId
        )
            .then(metaUserProjectInfo => {
                if(metaUserProjectInfo.length === 0) {
                    return res.status(400).json({
                        error: `No Projects` 
                    })
                } else {
                    res.json(metaUserProjectInfo)
                }
                
            }).catch(next)


    })

projectRouter
    .post('/create', jwtCheck, jsonBodyParser, getRoleId, (req, res, next) => {
            //Get userId
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
    
        if (token == null) return res.status(401)
        
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const userId = decoded.sub
        const roleId = req.roleId
        
            //deconstruct req.body
        const {name, description, projectImpacts, outcomesDesired, beneficiaries, orgId } = req.body
        

            //construct newProject
        const newProject = {
            name: xss(name), 
            description: xss(description),
            org_id: orgId
        }

            //reconstruct projectObject to send to Gateway api
        let theObj = {
            name: xss(name), 
            description: xss(description),
            project_impacts: projectImpacts,
            outcomes_desired: outcomesDesired
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
                        "project_id": project.id, 
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
                                "project_id": project.id, 
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
                                        project_id: project.project_id,
                                        user_id: userId,
                                        role_id: roleId
                                    }
                                )
                                    .then(projectUser => {
                                        if(beneficiaries.length > 0) {
                                            setBeneficiaries(project.id, beneficiaries)
                                        }
                                          // Need to change projectId to assetId? 
                                        theObj.projectId = project.project_id
                                            //send project to DS to get the indicators to the project
                                        getIndicators(theObj)
                                    })
                            })
                    })
            }).catch(next)

            function setBeneficiaries(projectId, beneficiaries) {
                const newBeneficiaries = []
                beneficiaries.map(beneficiary => {
                    newBeneficiaries.push({
                        "project_id": projectId, 
                        "name": xss(beneficiary.name), 
                        "life_change": xss(beneficiary.lifeChange)
                    })
                })
                ProjectService.createBeneficiaries(
                    req.app.get('db'),
                    newBeneficiaries
                )
                        //insert demographics into demographic table
                    .then(beneficiaryRes => {
                        let newDemographics = []
                        for(let i = 0; i < beneficiaries.length; i++) {
                            if (beneficiaries[i].demographics) {
                                for(let j = 0; j < beneficiaries[i].demographics.length; j++) {
                                        if (!beneficiaries[i].demographics[j].name || !beneficiaries[i].demographics[j].operator || !beneficiaries[i].demographics[j].value) {
                                            return res.status(400).json({
                                                error: `Name, operator, and value required in demographics request body`
                                            })
                                        } else {
                                            newDemographics.push({
                                                "beneficiary_id": beneficiaryRes[i].id,
                                                "name": xss(beneficiaries[i].demographics[j].name),
                                                "operator": xss(beneficiaries[i].demographics[j].operator),
                                                "value": xss(beneficiaries[i].demographics[j].value)
                                            })
                                        }
                                }
                            }
                        }
                        ProjectService.createDemographics(
                            req.app.get('db'),
                            newDemographics
                        )
                            .then(demographics => {
                                next
                            })
                    }).catch(next)    
            }

            function getIndicators(theObj) {
                    //Will be a post request but the endpoint is not functioning yet. Using jsonServer for now to create dummy data
                axios.post('https://feirpqbvp3.execute-api.us-east-2.amazonaws.com/test/echo', theObj) 
                    .then(indicators => {
                        let concatIndicators = []
                        indicators.data.indicators.map(indicator => {
                            concatIndicators.push({
                                "project_id": indicators.data.projectId, 
                                "indicator_id": indicator.indicatorId,
                                "aligned_strength": indicator.alignedStrength
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

    function getRoleId(req, res, next) {
        const roleName = req.body.role

        if(roleName) {
            RoleService.getByName(
                req.app.get('db'),
                role
            )
            .then(res => {
                console.log(res.id)
                next()
            }).catch(next)
        } else {
            RoleService.getByName(
                req.app.get('db'),
                "PROJECT_OWNER"
            )
            .then(res => {
                req.roleId = res.id
                next()
            }).catch(next)
        }
        
    }

module.exports = projectRouter
