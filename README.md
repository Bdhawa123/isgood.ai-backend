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
6. Create a database with DATABASENAME and your USERNAME
7. Run `npm run migrate` to create tables
8. Run `npm run dev` to start nodemon

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Migrations `npm run migrate`

Run the tests `npm test`


## Docs

### Register

api/users/register - (body must contain firstName, lastName, email, password)

### Login

api/auth/login - (body must include email and password)


### Organization

api/org/create - (body must contain name and url)
api/org - (retrieve all organizations based on userId)