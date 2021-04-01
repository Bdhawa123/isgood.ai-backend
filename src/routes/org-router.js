const express = require('express')
const path = require('path')
const xss = require('xss')
const OrgService = require('../services/org-service')
const AuthService = require('../services/auth-service')
const UsersService = require('../services/users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const orgRouter = express.Router()
const jsonBodyParser = express.json()

orgRouter
    //first check user for lastOrId if null then check orgUser table for orgs and return the orgs and user goes to global dash???

        //GET all organizations based on userId
    .get('/', requireAuth, jsonBodyParser, (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) return res.status(401)
        // console.log(token)

        const userId = AuthService.verifyJwt(token).userId

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
                const orgIds = orgUser.map(item => item.orgId)
                OrgService.getOrgs(
                    req.app.get('db'),
                    orgIds
                )
                    .then(orgs => {
                        res.json(orgs)
                    })
                    .catch(next)

            })
    })
    .post('/create', requireAuth, jsonBodyParser, (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) return res.status(401)
        // console.log(token)

        const userId = AuthService.verifyJwt(token).userId
        
        const {name, url} = req.body

            //Sanitize     !!! We need to verify the url is a url !!!
        const newOrg = {
            name: xss(name), 
            url: xss(url)
        }
            //make sure the fields are not empty
        for (const field of ['name', 'url'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            //Whats a good way to set these as default? 
        newOrg.plan = "free"
        newOrg.planStatus = "active"

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
                        userId: userId,
                        orgId: org.orgId
                    }
                )
                        //Update User so we know the last org they were logged into
                    .then(orgUser => {
                        //Update user 
                        UsersService.updateLatestOrg(
                            req.app.get('db'),
                            orgUser.userId,
                            {
                                lastOrgId: orgUser.orgId
                            }
                        )
                                //All is well! Send back the organization
                            .then(user => {
                                res.status(201)
                                .json(org)
                            })
                    })  
                    // Should we write some custom error handlers? https://expressjs.com/en/guide/error-handling.html
                    .catch(next)
            })
    })

module.exports = orgRouter
