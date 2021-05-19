const express = require('express')
const xss = require('xss')
const OrgService = require('../services/org-service')
const RoleService = require('../services/role-service')
const UsersService = require('../services/users-service')
let jwtCheck = require('../middleware/oAuth')
let Buffer = require('buffer/').Buffer
// const jwtAuthz = require('express-jwt-authz');

const orgRouter = express.Router()
const jsonBodyParser = express.json()
// const checkScopes = jwtAuthz([ 'Organization_Owner' ]);

orgRouter
    //first check user for lastOrId if null then check orgUser table for orgs and return the orgs and user goes to global dash???

        //GET all organizations based on userId
    .get('/', jwtCheck, jsonBodyParser, (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
    
        if (token == null) return res.status(401)
        
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const userId = decoded.sub

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
    })
    .post('/create', jwtCheck, jsonBodyParser, getRoleId, (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
    
        if (token == null) return res.status(401)
        
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const userId = decoded.sub
        const roleId = req.roleId
        
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
                        org_id: org.id,
                        role_id: roleId
                    }
                )
                        //Update User so we know the last org they were logged into
                    .then(orgUser => {
                        res.status(201)
                        .json(org)
                    })  
                    // Should we write some custom error handlers? https://expressjs.com/en/guide/error-handling.html
                    .catch(next)
            })
       
    })

    function getRoleId(req, res, next) {
        const roleName = req.body.role

        if(roleName) {
            RoleService.getByName(
                req.app.get('db'),
                role
            )
            .then(res => {
                console.log(res.id)
                next()
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

module.exports = orgRouter

