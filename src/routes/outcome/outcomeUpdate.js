const OutcomeService = require('../../services/outcome-service')

const updateOutcome = async (req, res, next) => {
    const {outcomesDesired} = req.body

    try{
        const outcomePromises = []
        const newOutcomes = []
        for (let i = 0; i < outcomesDesired.length; i++) {
            if(!outcomesDesired[i].description || outcomesDesired[i].description.length === 0) {
                return res.status(400).json({
                    error: {message: `Outcome description required`}
                })
            }
            let newOutcome = {
                description: outcomesDesired[i].description,
                'project_id': req.params.projectId
            }

            if(!outcomesDesired[i].id){
                newOutcomes.push(newOutcome)  
            } else {
                outcomePromises.push(OutcomeService.updateOutcomes(
                    req.app.get('db'),
                    req.params.projectId,
                    outcomesDesired[i].id,
                    newOutcome
                ))   
            }
        }

        if(newOutcomes.length > 0) {
            const outcomesAdded = await OutcomeService.createOutcome(
                req.app.get('db'),
                newOutcomes
            )
        }

        const outcomes = await Promise.all(outcomePromises)
        const getOutcomes = await OutcomeService.getOutcomes(
            req.app.get('db'),
            req.params.projectId,
        )

        res.status(200).json(getOutcomes)
    } catch(err) {
        next(err)
    }
}

module.exports = {
    updateOutcome
}