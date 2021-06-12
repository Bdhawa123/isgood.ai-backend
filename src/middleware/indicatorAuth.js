const axios = require("axios");
const config = require("../config");

function indicatorAuth(req, res, next) {
  const theObj = {
    username: config.IS_GOOD_USERNAME,
    password: config.IS_GOOD_PASSWORD,
  };
  axios
    .post(config.GATEWAY_AUTH_DOMAIN, theObj)
    .then((auth) => {
      res.authToken = auth.data.token;
      next();
    })
    .catch(next);
}

module.exports = {
  indicatorAuth,
};
