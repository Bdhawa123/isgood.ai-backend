
const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    userId: user.userId,
    name: xss(user.name),
    email: xss(user.email),
    hashedPassword: xss(user.hashedPassword),
    createdAt: user.createdAt,
    status: true
})

usersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        UsersService.getAllUsers(knexInstance)
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, email, hashedPassword } = req.body
        const newUser = { name, email, hashedPassword }

        for (const [key, value] of Object.entries(newUser)) {
            if (value == null || value.length === 0) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        // newUser.role = "basic"

        UsersService.insertUser(
            req.app.get('db'),
            newUser
        )
            .then(user => {
                res 
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${user.userId}`))
                    .json(serializeUser(user))
            })
            .catch(next)
    })
usersRouter
    .route('/login')
    .post(jsonParser, (req, res, next) => {
        const email = req.body.email;
        const hashedPassword = req.body.hashedPassword;
        
        UsersService.getByLogin(
            req.app.get('db'),
            email,
            hashedPassword
        )
        .then(user => {
            res 
                .status(201)
                //.location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(serializeUser(user))
        })
        .catch(next)
            
    })

usersRouter 
    .route(`/:user_id`)
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.user_id
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: { message: `User doesn't exist` }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeUser(res.user))
    })
    .delete((req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, email, hashedPassword } = req.body
        const userToUpdate = { name, email, hashedPassword }

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'email', or 'hashedPassword'`
                }
            })
        UsersService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = usersRouter