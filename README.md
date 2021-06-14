# isgood.ai backend

This is isgood.ai's RESTful api!

## Set up

Complete the following steps to get started:

1. Clone this repository to your local machine `git clone "URL" isgood.ai-backend`
2. `cd` into the cloned repository
3. Install the node dependencies `npm install`
4. Create an `.env` that will be ignored by git and read by the express server
5. Edit the `.env` file
   NODE_ENV=development
   PORT=8000
   DATABASE_URL="postgresql://USERNAME@localhost/DATABASENAME"
   TEST_DATABASE_URL="postgresql://USERNAME@localhost/DATABASENAME_test"
   JWT_SECRET="my-own-special-jwt-secret"
   JWT_EXPIRY="5h"
   CLIENT_ID=""
   CLIENT_SECRET=""
   AUTH0_DOMAIN=""
   CLIENT_ID_MANAGEMENT=""
   CLIENT_SECRET_MANAGEMENT=""
   IS_GOOD_USERNAME=""
   IS_GOOD_PASSWORD=""
   GATEWAY_AUTH_DOMAIN=""
   GATEWAY_GET_INDICATORS=""
   GATEWAY_INDICATOR_DETAILS=""
   AWS_ACCESS_KEY_ID=""
   AWS_SECRET_ACCESS_KEY=""
   BUCKET_NAME=""
   BUCKET_REGION=""
6. Create a database with DATABASENAME and your USERNAME
7. Run `npm run migrate` to create tables
8. Run `npm run dev` to start nodemon

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Migrations `npm run migrate`

Run the tests `npm test`

## Docs

Protected Endpoints need an Authorization header containing the Bearer token

### Organization

POST
api/org/create - (body must contain name and url and a Authorization header containing the Bearer token)

GET
api/org - (retrieve all organizations based on userId and a Authorization header containing the Bearer token)

DELETE
api/org/:orgId

### Projects

POST
api/project/create - (body must contain orgId, name, description, projectImpacts, and outcomesDesired)

GET
api/project - (returns \* projects based on user)

api/project/:projectId - (returns project info and indicators for the project)

PATCH
api/project/:projectId - (body must contain {"name": "string", "orgId": "string", "description": "string" } Optional: {"coordinates": [ array ], "startDate": "TIMESTAMP" "endDate": "TIMESTAMP" } )

DELETE
api/project/:projectId - (Query params required- orgId = string)

### Impacts

PATCH
api/impact/update/:projectId - (body must contain orgId and projectImpacts: [{id: "number", description: "String"}] if added new impact then "id" key value pair must be left out)

DELETE
api/impact/delete/:projectId - (body must contain {"orgId": "string","deleteImpactIds": [ numbers ] })

### Outcomes

PATCH
api/outcome/update/:projectId = (body must contain orgId and outcomesDesired: [{id: "number", description: "String"}] if added new impact then "id" key value pair must be left out)

DELETE
api/outcome/delete/:projectId - (body must contain {"orgId": "string","deleteOutcomeIds": [ numbers ] })

### Indicators

POST
api/indicator/:projectId - (this endpoint fetches indicators to assign to a project. Body requires: { "orgId": "or-qxaoKx" } )

POST
api/indicator/details/:projectId - (this endpoint fetches the details for the indicators passed in the body. Body requires: { "orgId": "or-qxaoKx" })
