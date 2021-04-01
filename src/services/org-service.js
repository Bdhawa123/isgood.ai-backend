const xss = require('xss')

const OrgService = {
    createOrg(db, newOrg) {
        return db
        .insert(newOrg)
        .into('org')
        .returning('*')
        .then(([org]) => org)
    },
    createOrgUser(db, orgUserInfo) {
        return db   
        .insert(orgUserInfo)
        .into('orgUser')
        .returning('*')
        .then(([orgUser]) => orgUser)
    },

    serializeOrg(org) {
        return {
            orgId: org.orgId,
            name: xss(org.name),
            url: xss(org.url),
            plan: org.plan,
            planStatus: org.planStatus
        }
    }
}

module.exports = OrgService