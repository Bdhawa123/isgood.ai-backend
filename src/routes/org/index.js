const express = require('express')
const orgRouter = express.Router()
const jsonBodyParser = express.json()
let jwtCheck = require('../../middleware/oAuth')
const {listOrgs} = require('./orgList')
const {postOrg, getRoleId} = require('./orgCreate')

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const uploadS3 = require("../../middleware/multerS3")


orgRouter
    .get(
        '/', jwtCheck,
        listOrgs
    )

orgRouter
    .post(
        '/create', jwtCheck, uploadS3.any(), getRoleId, 
        postOrg, 
    )


module.exports = orgRouter