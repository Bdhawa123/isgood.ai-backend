const xss = require('xss')
const ProjectService = require('../../services/project-service')
const OrgService = require('../../services/org-service')
const {RoleService} = require('../../services/role-service')
const ImpactService = require('../../services/impact-service')
const OutcomeService = require('../../services/outcome-service')

function postProject (req, res, next) {
    const userId = req.user.sub
    const roleId = req.roleId
    
        //deconstruct req.body
    const {name, description, projectImpacts, outcomesDesired, beneficiaries, orgId, startDate, endDate, coordinates } = req.body

    //make sure the fields are not empty
    for (const field of ['name', 'description', 'projectImpacts', 'outcomesDesired', 'orgId'])
    if (!req.body[field])
        return res.status(400).json({
            error: {message: `Missing '${field}' in request body`}
        })
        
        //construct newProject
    const newProject = {
    name: xss(name), 
    description: xss(description),
    org_id: orgId,
    }

        // check if startDate and endDate are valid before saving to db
    Date.prototype.isValid = function () {
        // An invalid date object returns NaN for getTime() and NaN is the only
        // object not strictly equal to itself.
        return this.getTime() === this.getTime();
    }; 

    if (startDate) {
        let sd = new Date(startDate);
        let checkStartDate = sd.isValid()
        if(startDate.length !== 0 && !checkStartDate) {
            return res.status(400).json({
                error: {message: `${startDate} is an invalid timestamp`}
            })
        } else if (startDate.length !== 0) {
            newProject.start_date = startDate;
        }

    }
    if (endDate) {
        let ed = new Date(endDate);
        let checkEndDate = ed.isValid()

        if (endDate.length !== 0 && !checkEndDate) {
            return res.status(400).json({
                error: {message: `${endDate} is an invalid timestamp`}
            })
        } else if (endDate.length !== 0) {
            newProject.end_date = endDate;
        } 
    }
    
    

    //save geoLocation if exists
    if(coordinates && coordinates.length !== 0) {
        newProject.geolocation = [xss(coordinates[0]), xss(coordinates[1])]
    }

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
                    "project_id": project.project_id, 
                    "description": xss(impact)
                })
            })

            ImpactService.createImpact(
                req.app.get('db'),
                newImpacts
            )
            //once impacts are created.. insert projectOutcomes in outcome table
                .then(impacts => {
                    let newOutcomes = []
                    outcomesDesired.map(outcome => {
                        newOutcomes.push({
                            "project_id": project.project_id, 
                            "description": xss(outcome)
                        })
                    })
                    OutcomeService.createOutcome(
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
                                      res.status(201).json(project)
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
}

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

module.exports = {
    postProject,
    getRoleId,
    orgExists
}