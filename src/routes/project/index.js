const express = require('express')
const projectRouter = express.Router()
const jsonBodyParser = express.json()
let jwtCheck = require('../../middleware/oAuth')
const {listProjects} = require('./projectList')
const {getRoleId, orgExists, postProject} = require('./projectCreate')
const {checkProjectExists, handleIndicatorsDesc, getBeneficiaries, findProject} = require('./projectFind')
const {updateProject} = require('./projectUpdate')

projectRouter
    .get(
        '/', jwtCheck,
        listProjects,
    );
projectRouter
    .post(
        '/create', jwtCheck, jsonBodyParser, getRoleId, orgExists, 
        postProject
    )
projectRouter
    .route('/:projectId')
    .all(jwtCheck)
    .get(
        checkProjectExists, handleIndicatorsDesc, getBeneficiaries,
        findProject
    )
    .patch(
        checkProjectExists, jsonBodyParser,
        updateProject
    )




module.exports = projectRouter