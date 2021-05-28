require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors =  require('cors')
const helmet = require('helmet')
const logger = require('./logger')
const { NODE_ENV } = require('./config')
const usersRouter = require('./routes/users-router')
const orgRouter = require('./routes/org/index')
const projectRouter = require('./routes/project/index')


const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())


//------------------Router-----------------------//

app.use('/api/users', usersRouter)
app.use('/api/org', orgRouter)
app.use('/api/project', projectRouter)


app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        console.error(error)
        response = {message: error.message, error}
    }
    res.status(500).json(response)

})

module.exports = app