const express = require('express')
const xss = require('xss')
const axios = require('axios')
const ProjectService = require('../services/project-service')
const OrgService = require('../services/org-service')
const RoleService = require('../services/role-service')
let Buffer = require('buffer/').Buffer
let jwtCheck = require('../middleware/oAuth')
const projectRouter = express.Router()
const jsonBodyParser = express.json()


  

projectRouter
    .get('/', jwtCheck, jsonBodyParser, (req, res, next) => {
        const userId = req.user.sub

        ProjectService.getProjectIdBasedOnUser(
            req.app.get('db'),
            userId
        )
            .then(projectUser => {
                if(!projectUser) {
                    return res.status(400).json({
                        error: {message: `No Projects`} 
                    })
                }
                const projectIds = projectUser.map(item => item.project_id)
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
    .get('/:projectId', jwtCheck, jsonBodyParser, checkProjectExists, handleIndicatorsDesc, getBeneficiaries, (req, res, next) => {
        const {metaUserProjectInfo} = req


                ProjectService.getImpacts(
                    req.app.get('db'),
                    metaUserProjectInfo.id
                )
                    .then(impacts => {
                        ProjectService.getOutcomes(
                            req.app.get('db'),
                            metaUserProjectInfo.id
                        )
                            .then(outcomes => {
                                ProjectService.getById(
                                    req.app.get('db'),
                                    metaUserProjectInfo.project_id
                                )
                                    .then(project => {
                                        project.impacts = impacts
                                        project.outcomes = outcomes
                                        project.beneficiaries = req.beneficiaries
                                        project.indicators = req.indicators
                                        res.status(200).json(project)
                                    }) 
                            })
                        
                    }).catch(next)
        
    })

    function getBeneficiaries(req, res, next) {
        let projectId = req.params.projectId
        ProjectService.getBeneficiaries(
            req.app.get('db'),
            projectId
        )
            .then(beneficiaries => {
                let beneficiaryIds = beneficiaries.map(beneficiary => beneficiary.beneficiary_id)
                ProjectService.getLifeChange(
                    req.app.get('db'),
                    beneficiaryIds
                )
                    .then(lifeChanges => {
                        let newBeneficiary = beneficiaries
                        for(let i = 0; i < beneficiaries.length; i++){
                            newBeneficiary[i].lifeChange = []
                            for(let j = 0; j < lifeChanges.length; j++) {
                                if(beneficiaries[i].beneficiary_id == lifeChanges[j].beneficiary_id) {
                                    newBeneficiary[i].lifeChange.push({
                                        'life_change_id': lifeChanges[j].life_change_id,
                                        'description': lifeChanges[j].description
                                    })
                                }
                            }
                        }
                        ProjectService.getDemographics(
                            req.app.get('db'),
                            beneficiaryIds
                        )
                            .then(demographics => {
                                for(let i = 0; i < beneficiaries.length; i++){
                                    newBeneficiary[i].demographics = []
                                    for(let j = 0; j < demographics.length; j++){
                                        if(beneficiaries[i].beneficiary_id == demographics[j].beneficiary_id) {
                                            newBeneficiary[i].demographics.push({
                                                'demographic_id': demographics[j].demographic_id,
                                                'name': demographics[j].name,
                                                'operator': demographics[j].operator,
                                                'value': demographics[j].value
                                            })
                                        }
                                    }
                                }
                                req.beneficiaries = newBeneficiary
                            })
                    })

            }).catch(next)
        next()
    }

projectRouter
    .patch('/projectId', jwtCheck, jsonBodyParser, checkProjectExists, (req, res, next) => {
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


    })


    function handleIndicatorsDesc(req, res, next){
        ProjectService.getIndicators(
            req.app.get('db'),
            req.params.projectId
        )
            .then(metaIndicatorInfo => {
                if(metaIndicatorInfo.length === 0) {
                    req.indicators = 'there was a problem fetching project indicators'
                } else {
                    let ids = metaIndicatorInfo.map(indicator => indicator.indicator_id)
                    let indicators = getIndicatorDesc(ids)
                    let completeIndicators = []
                    for(let i = 0; i < indicators.length; i++) {
                        for(let j = 0; j < metaIndicatorInfo.length; j++) {
                            if(indicators[i].id == metaIndicatorInfo[j].indicator_id) {
                                completeIndicators.push({
                                    'indicator_id': metaIndicatorInfo[j].indicator_id,
                                    'description': indicators[i].description,
                                    'aligned_strength': metaIndicatorInfo[j].aligned_strength
                                })
                            }
                        }
                    }
                    req.indicators = completeIndicators
                }
                
            }).catch(next)
        
        next()

        function getIndicatorDesc(ids) {
            let indicators = [
                {
                    id: 1,
                    description: "This is a indicator description"
                },
                {
                    id: 2,
                    description: "This is a indicator description"
                },
                {
                    id: 3,
                    description: "This is a indicator description"
                }
            ]
            return indicators
        }
    }

projectRouter
    .post('/create', jwtCheck, jsonBodyParser, getRoleId, orgExists, (req, res, next) => {
        
        const userId = req.user.sub
        const roleId = req.roleId
       
        
            //deconstruct req.body
        const {name, description, projectImpacts, outcomesDesired, beneficiaries, orgId, startDate, endDate, coordinates } = req.body
            
            //construct newProject
        const newProject = {
        name: xss(name), 
        description: xss(description),
        org_id: orgId,
        geolocation: [xss(coordinates[0]), xss(coordinates[1])],
        }

        Date.prototype.isValid = function () {
            // An invalid date object returns NaN for getTime() and NaN is the only
            // object not strictly equal to itself.
            return this.getTime() === this.getTime();
        }; 

        let sd = new Date(startDate);
        let ed = new Date(endDate);

        let checkStartDate = sd.isValid()
        let checkEndDate = ed.isValid()


        if(startDate.length !== 0 && !checkStartDate) {
            return res.status(400).json({
                error: {message: `${startDate} is an invalid timestamp`}
            })
        } else if (startDate.length !== 0) {
            newProject.start_date = startDate;
        }
        
        if (endDate.length !== 0 && !checkEndDate) {
            return res.status(400).json({
                error: {message: `${endDate} is an invalid timestamp`}
            })
        } else if (endDate.length !== 0) {
            newProject.end_date = endDate;
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
                error: {message: `Missing '${field}' in request body`}
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
                                        if(beneficiaries && beneficiaries.length > 0) {
                                            setBeneficiaries(project.project_id, beneficiaries)
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
                    })
                })
                ProjectService.createBeneficiaries(
                    req.app.get('db'),
                    newBeneficiaries
                )
                        //insert demographics into demographic table
                    .then(beneficiaryRes => {
                        let lifeChanges = []
                        for(let i = 0; i < beneficiaries.length; i++) {
                            for(let j = 0; j < beneficiaries[i].lifeChange.length; j++) {
                                lifeChanges.push({
                                    "beneficiary_id": beneficiaryRes[i].beneficiary_id,
                                    "description": xss(beneficiaries[i].lifeChange[j])
                                })
                            }
                        }
                        ProjectService.createLifeChange(
                            req.app.get('db'),
                            lifeChanges
                        )
                            .then(lifeChangesRes => {
                                let newDemographics = []
                                for(let i = 0; i < beneficiaries.length; i++) {
                                    if (beneficiaries[i].demographics) {
                                        for(let j = 0; j < beneficiaries[i].demographics.length; j++) {
                                                if (!beneficiaries[i].demographics[j].name || !beneficiaries[i].demographics[j].operator || !beneficiaries[i].demographics[j].value) {
                                                    return res.status(400).json({
                                                        error: {message: `Name, operator, and value required in demographics request body`}
                                                    })
                                                } else {
                                                    newDemographics.push({
                                                        "beneficiary_id": beneficiaryRes[i].beneficiary_id,
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
                            })
                    }).catch(next)    
            }

            function getIndicators(theObj) {
                    //Will be a post request but the endpoint is not functioning yet. Using jsonServer for now to create dummy data
                axios.post('https://9deylj26rg.execute-api.us-east-2.amazonaws.com/test', theObj) 
                    .then(indicators => {
                        console.log(indicators.data.indicators)
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
                    }).catch(error => {
                            res.status(201).send({
                                error: {message: "There has been an issue fetching projects indicators"}
                            })
                        next()
                    })
            }
    })

    function getRoleId(req, res, next) {
        const roleName = req.body.role
        if(roleName) {
            RoleService.getByName(
                req.app.get('db'),
                roleName
            )
            .then(roleId => {
                if(!roleId) {
                    return res.status(400).json({
                        error: {message: `Role '${roleName}' does not exist`} 
                    })
                } else {
                    req.roleId = roleId.id
                    next()
                }
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

    function orgExists(req, res, next) {
        const orgId = req.body.orgId
        if(orgId) {
            OrgService.getByOrgId(
                req.app.get('db'),
                orgId
            )
            .then(org => {
                if(!org) {
                    return res.status(400).json({
                        error: {message: `Organisation does not exist`} 
                    })
                } else {
                    next()
                }
            }).catch(next)
        } else {
            return res.status(400).json({
                error: {message: `Missing '${field}' in request body`}
            })
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



module.exports = projectRouter
