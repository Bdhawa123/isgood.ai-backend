const app = require('../src/app')
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: process.env.TEST_DATABASE_URL
})

process.env.TZ = 'UCT'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_EXPIRY = '5m'

const Auth = {
  Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFnWF8yM0xrYkl6QmMzcDhoTkQ0dCJ9.eyJpc3MiOiJodHRwczovL2lzZ29vZC13ZWJhcHAudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYwYjgxODhlOWRhNjUyMDA3ODQzMWY5ZCIsImF1ZCI6WyJodHRwczovL3d3dy5pc2dvb2QtYXBpLmNvbSIsImh0dHBzOi8vaXNnb29kLXdlYmFwcC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjIzMTA0OTE1LCJleHAiOjE2MjM5Njg5MTUsImF6cCI6ImhwZlJpOHFaakVWVVpOcXhoNTl0d1pGNDlxanBFRFVpIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInBlcm1pc3Npb25zIjpbXX0.LalfNtePY827O-J8UKsgzddqo6lo6cCu4kne9qR0mDghKMVwuJCY_WifksmW_7lo25Xqtgl0s1kzt13xcOUOvJx2ZdOi2XFSn2KtStjB8y9etxoBTy5EISqEWbtK6-Y3-U2INcD5O_JLnbQXG4AdA4GB662TFzR0uakALVuUoBBqKyYZMDsevL2z9aDtOY97xBUzg2-f5kXo22PXu3xqd7JZc_XG8lVbijuxG7YmBxtXgDYGwjy58kOiSidtMw-N3U0fTRHgf945nyHZ4uPInMJxEw_0c8f7zUFFP_phjMF1NKJJSH_LSL7jd0x3ugT1JTdI4vNXLnEU7sFJGy9ucw',
  "Content-Type": "application/json",
}

module.exports = {
  app,
  db,
  Auth,
}