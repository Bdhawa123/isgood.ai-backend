const axios = require("axios");

const AuthService = {
  getManagementApiJwt() {
    const clientId = process.env.CLIENT_ID_MANAGEMENT;
    const clientSecret = process.env.CLIENT_SECRET_MANAGEMENT;
    const domain = process.env.AUTH0_DOMAIN;

    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      audience: domain + "/api/v2/",
      grant_type: "client_credentials",
    };

    return axios.post(domain + "/oauth/token", data);
  },
};

module.exports = AuthService;
