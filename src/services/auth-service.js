const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const axios = require("axios");

const AuthService = {
  getUserWithEmail(db, email) {
    return db("user").where({ email }).first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: "RS256",
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["RS256"],
    });
  },
  parseBasicToken(token) {
    return Buffer.from(token, "base64").toString().split(":");
  },
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
