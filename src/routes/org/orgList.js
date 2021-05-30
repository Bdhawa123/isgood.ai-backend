const OrgService = require('../../services/org-service')
const getOrgRole = require('../../services/role-service')
    //first check user for lastOrId if null then check orgUser table for orgs and return the orgs and user goes to global dash???

    //GET all organizations based on userId
function listOrgs(req, res, next) {
    
    const userId = req.user.sub

    OrgService.getOrgIdBasedOnUser(
        req.app.get('db'),
        userId
    )
        .then(orgUser => {
            console.log(orgUser)
            if(!orgUser) {
                return res.status(200).json({
                    message: `No Organizations` 
                })
            }
            const orgIds = orgUser.map(item => item.org_id)
            // const orgRoleId = orgUser.map(item => item.role_id)
            OrgService.getOrgs(
                req.app.get('db'),
                orgIds
            )
                .then(orgs => {
                    for(let i = 0; i < orgs.length; i++) {
                        for(let j = 0; j < orgUser.length; j++) {
                            if(orgs[i].org_id === orgUser[j].org_id) {
                                orgs[i].role = orgUser[j].name
                            }
                        }
                    }
                    
                    res.status(200)
                    .json(orgs)
                })
                .catch(next)

        })
}

module.exports = {
    listOrgs
}