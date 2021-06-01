const config = require('../config')
const axios = require('axios')

function indicatorAuth(req, res, next) {
    theObj = {
        'username': config.IS_GOOD_USERNAME,
        'password': config.IS_GOOD_PASSWORD
    }
    axios.post(config.GATEWAY_AUTH_DOMAIN, theObj) 
        .then(auth => {
            res.authToken = auth.data.token
            next()
        }).catch(next)
}

module.exports = {
    indicatorAuth
}