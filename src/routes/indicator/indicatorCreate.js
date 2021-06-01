const IndicatorsService = require('../../services/indicator-service')
const OutcomeService = require('../../services/outcome-service')
const ImpactService = require('../../services/impact-service')
const axios = require('axios')
const config = require('../../config')

const handleIndicators = (req, res, next) => {
    const project = req.project

    //Will be a post request but the endpoint is not functioning yet. Using jsonServer for now to create dummy data
axios.post(config.GATEWAY_GET_INDICATORS, project) 
    .then(indicators => {
        let concatIndicators = []
        indicators.data.indicators.map(indicator => {
            concatIndicators.push({
                "project_id": indicators.data.projectId, 
                "indicator_id": indicator.indicatorId,
                "aligned_strength": indicator.alignedStrength
            })
        })
        IndicatorsService.createIndicators(
            req.app.get('db'),
            concatIndicators
        )
        .then(setIndicators => {
            res.status(201)
            .json(setIndicators)
        })
    }).catch(error => {
            res.status(201).send({
                error: {message: "There has been an issue fetching projects indicators"}
            })
        next()
    })
}

function getProject(req, res, next) {
    const {projectId} = req.params

            ImpactService.getImpacts(
                req.app.get('db'),
                projectId
            )
                .then(impacts => {
                    impactDescriptions = impacts.map(impact => impact.description)
                    OutcomeService.getOutcomes(
                        req.app.get('db'),
                        projectId
                    )
                        .then(outcomes => {
                            outcomeDescriptions = outcomes.map(outcome => outcome.description)
                            IndicatorsService.getProjectById(
                                req.app.get('db'),
                                projectId
                            )
                                .then(project => {
                                    project.projectId = projectId
                                    project.impacts = impactDescriptions
                                    project.outcomes = outcomeDescriptions
                                    req.project = project
                                    next()
                                }) 
                        })
                    
                }).catch(next)
    
}

module.exports = {
    handleIndicators,
    getProject
}