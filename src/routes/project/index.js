const express = require('express')
const projectRouter = express.Router()
const jsonBodyParser = express.json()
let jwtCheck = require('../../middleware/oAuth')
const {checkProjectCreate, checkProjectRead, checkProjectUpdate} = require('../../middleware/checkRole')
const {listProjects} = require('./projectList')
const {getRoleId, orgExists, postProject} = require('./projectCreate')
const {checkProjectExists, getBeneficiaries, findProject} = require('./projectFind')
const {updateProject} = require('./projectUpdate')

projectRouter
    .get(
        '/', jwtCheck,
        listProjects,
    );
projectRouter
    .post(
        '/create', jwtCheck, jsonBodyParser, orgExists, checkProjectCreate, getRoleId,  
        postProject
    )
projectRouter
    .route('/:projectId')
    .all(jwtCheck)
    .get(
        checkProjectExists, checkProjectRead, getBeneficiaries,
        findProject
    )
    .patch(
        checkProjectExists, jsonBodyParser, checkProjectUpdate,
        updateProject
    )




module.exports = projectRouter