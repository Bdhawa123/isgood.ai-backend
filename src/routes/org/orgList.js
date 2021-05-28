const OrgService = require('../../services/org-service')
    //first check user for lastOrId if null then check orgUser table for orgs and return the orgs and user goes to global dash???

    //GET all organizations based on userId
function listOrgs(req, res, next) {
    
    const userId = req.user.sub

    OrgService.getOrgIdBasedOnUser(
        req.app.get('db'),
        userId
    )
        .then(orgUser => {
            if(!orgUser) {
                return res.status(200).json({
                    message: `No Organizations` 
                })
            }
            const orgIds = orgUser.map(item => item.id)
            OrgService.getOrgs(
                req.app.get('db'),
                orgIds
            )
                .then(orgs => {
                    res.status(200)
                    .json(orgs)
                })
                .catch(next)

        })
}

module.exports = {
    listOrgs
}