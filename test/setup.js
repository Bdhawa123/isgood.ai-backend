const knex = require("knex");
const app = require("../src/app");

const db = knex({
  client: "pg",
  connection: process.env.TEST_DATABASE_URL,
});

process.env.TZ = "UCT";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRY = "5m";

const Auth = {
  Authorization:
    "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFnWF8yM0xrYkl6QmMzcDhoTkQ0dCJ9.eyJpc3MiOiJodHRwczovL2lzZ29vZC13ZWJhcHAudXMuYXV0aDAuY29tLyIsInN1YiI6ImZrR1hoSHlCT04yUlFtU1I5YzN2aGNvZ3pUSTZGajJqQGNsaWVudHMiLCJhdWQiOiJodHRwczovL3d3dy5pc2dvb2QtYXBpLmNvbSIsImlhdCI6MTYyMzgwNTMyMiwiZXhwIjoxNjI0NjY5MzIyLCJhenAiOiJma0dYaEh5Qk9OMlJRbVNSOWMzdmhjb2d6VEk2RmoyaiIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyIsInBlcm1pc3Npb25zIjpbXX0.JPOpvH7uZdCOHudJMBQGBdsUZZ-DHYf5plUg4CwcqnnJNhGco_qLSCuTFSND48DK5vC7GRWNzA8RKw10KpekwQZmy-CaTLObgu2coDaDx8wuiEvnDm210MlN68zFQNDc069T8T_SRlMwzAu5F5jndevmmJlRLDnhD4g2MDwczW9GPO2o7S0DEuJ_fz6EsO7ZnlbziQhpssOSAp6yZWvvrCsKO9rJPqhBodAMsop0okXlb84z8RTdrayVFuhriXELxvF8bCtUwoIQPJNngkFBEwKOr13hu0S_YXXu1mge8cAPRPPr3kPSjwDwWR5_5swBmS8v4elwA49k-cOMro229w",
  "Content-Type": "application/json",
};

module.exports = {
  app,
  db,
  Auth,
};
