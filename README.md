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
6. Create a database with DATABASENAME and your USERNAME
7. Run `npm run migrate` to create tables
8. Run `npm run dev` to start nodemon

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Migrations `npm run migrate`

Run the tests `npm test`


## Docs

### User

GET all users: /api/users
GET user by id: /api/users/:id

POST a new user: /api/users (body must include name, email, password) POST to Login: /api/users/login (body must include email & password)

DELETE user: /api/users/:id

PATCH user: /api/users/:id (Request body must contain either 'name', 'email', or 'password')
