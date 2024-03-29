/* eslint-disable node/no-unpublished-require */
process.env.TZ = "UCT";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRY = "3m";

require("dotenv").config();

process.env.TEST_DB_URL =
  process.env.TEST_DB_URL ||
  "postgresql://mattsirkis@localhost/isgooddatabase_test";

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
