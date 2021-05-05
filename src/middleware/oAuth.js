let jwt = require('express-jwt');
let jwks = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');

let jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://isgood-webapp.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://www.isgood-api.com',
  issuer: 'https://isgood-webapp.us.auth0.com/',
  algorithms: ['RS256']
});


module.exports = jwtCheck