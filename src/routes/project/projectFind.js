const ProjectService = require('../../services/project-service')
const OutcomeService = require('../../services/outcome-service')
const ImpactService = require('../../services/impact-service')

function findProject(req, res, next) {
    const {metaUserProjectInfo} = req

            ImpactService.getImpacts(
                req.app.get('db'),
                metaUserProjectInfo.project_id
            )
                .then(impacts => {
                    OutcomeService.getOutcomes(
                        req.app.get('db'),
                        metaUserProjectInfo.project_id
                    )
                        .then(outcomes => {
                            ProjectService.getById(
                                req.app.get('db'),
                                metaUserProjectInfo.project_id
                            )
                                .then(project => {
                                    project.role = req.role.name
                                    project.impacts = impacts
                                    project.outcomes = outcomes
                                    project.beneficiaries = req.beneficiaries
                                    res.status(200).json(project)
                                }) 
                        })
                    
                }).catch(next)
    
}

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
                            next()
                        })
                })

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
    findProject,
    getBeneficiaries,
    checkProjectExists
}