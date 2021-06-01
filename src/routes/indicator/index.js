const express = require('express')
const indicatorRouter = express.Router()
const jsonBodyParser = express.json()
let jwtCheck = require('../../middleware/oAuth')
const {indicatorAuth} = require('../../middleware/indicatorAuth') 
const {checkProjectUpdate} = require('../../middleware/checkRole')
const {getProject, handleIndicators} = require('./indicatorCreate')
const {handleIndicatorsDesc} = require('./indicatorGetDetails')

indicatorRouter
    .route('/:projectId')
    .post(
        jwtCheck, jsonBodyParser, checkProjectUpdate, indicatorAuth, getProject,
        handleIndicators
    )
indicatorRouter
    .route('/details/:projectId')
    .post(
        jwtCheck,jsonBodyParser, checkProjectUpdate, indicatorAuth,
        handleIndicatorsDesc
    )


module.exports = indicatorRouter