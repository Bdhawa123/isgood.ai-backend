const ImpactService = require('../../services/impact-service')

const deleteImpacts = async (req, res, next) => {
    const {deleteImpactIds} = req.body

    try{ 
        const impactPromises = []
        for (let i = 0; i < deleteImpactIds.length; i++) {
            impactPromises.push(ImpactService.deleteImpact(
                req.app.get('db'),
                deleteImpactIds[i],
            ))   
        }
        const impacts = await Promise.all(impactPromises)
        const getImpacts = await ImpactService.getImpacts(
            req.app.get('db'),
            req.params.projectId,
        )

        res.status(200).json(getImpacts)
    } catch (err) {
        next(err)
    }
}

module.exports = {
    deleteImpacts
}