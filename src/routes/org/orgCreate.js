const xss = require('xss')
const OrgService = require('../../services/org-service')
const {RoleService} = require('../../services/role-service')
const AWS_S3_Service = require('../../services/aws-s3-service')



function postOrg(req, res, next) {
        
    const userId = req.user.sub
    const roleId = req.roleId
    
    const {name, url, handle, description, region, sector, logoId } = req.body
        //Sanitize     !!! We need to verify the url is a url !!!
    const newOrg = {
        name: xss(name), 
        url: xss(url),
        description: xss(description),
        handle: xss(handle),
        region: xss(region),
        sector: xss(sector)
    }
        //make sure the fields are not empty
    for (const field of ['name', 'url'])
        if (!req.body[field])
            return res.status(400).json({
                error: {message: `Missing '${field}' in request body`}
            })
        //Whats a good way to set these as default? 
    newOrg.plan = "free"
    newOrg.plan_status = "active"


            //Create Organization
    
    OrgService.createOrg(
        req.app.get('db'),
        newOrg
    )
        .then(org => {
                //Now create an orgUser entry
            OrgService.createOrgUser(
                req.app.get('db'),
                {
                    user_id: userId,
                    org_id: org.org_id,
                    role_id: roleId
                }
            )
                    //Update User so we know the last org they were logged into
                .then(orgUser => {
                    if(!logoId) {
                        return res.status(201)
                        .json(org)
                    }

                    AWS_S3_Service.checkOrgLogo(
                        req.app.get('db'),
                        logoId
                    )
                        .then(orgLogo => {
                            if(!orgLogo) {
                                return res.status(201).json({
                                    org,
                                    error: {message: `No logo with id: ${logoId}`} 
                                })
                            }
                            const newOrgLogo = {
                                org_id: org.org_id
                            }
                            AWS_S3_Service.updateOrgLogo(
                                req.app.get('db'),
                                logoId,
                                newOrgLogo
                            )
                                .then(updatedOrgLogo => {
                                    res.status(201)
                                    .json({org, updatedOrgLogo})
                                })
                        })
                   
                })  
                // Should we write some custom error handlers? https://expressjs.com/en/guide/error-handling.html
                .catch(next)
        })
   
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
            "ORGANIZATION_OWNER"
        )
        .then(res => {
            req.roleId = res.id
            next()
        }).catch(next)
    }
    
}

module.exports = {
    postOrg,
    getRoleId
}