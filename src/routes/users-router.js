const { default: axios } = require("axios");
const express = require("express");
const path = require("path");
const UsersService = require("../services/users-service");
const AuthService = require("../services/auth-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const jwtCheck = require("../middleware/oAuth");

usersRouter
  //validate email before create user
  .post("/register", jsonBodyParser, (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    for (const field of ["firstName", "lastName", "email", "password"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    // TODO: check user_name doesn't start with spaces

    const passwordError = UsersService.validatePassword(password);

    if (passwordError) return res.status(400).json({ error: passwordError });

    UsersService.hasUserWithEmail(req.app.get("db"), email)
      .then((hasUserWithEmail) => {
        if (hasUserWithEmail)
          return res.status(400).json({ error: `Email already taken` });

        return UsersService.hashPassword(password).then((hashedPassword) => {
          const newUser = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            createdAt: "now()",
          };

          return UsersService.insertUser(req.app.get("db"), newUser).then(
            (user) => {
              res
                .status(201)
                // userId?
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(UsersService.serializeUser(user));
            }
          );
        });
      })
      .catch(next);
  })

  .post("/update", jsonBodyParser, jwtCheck, (req, res, next) => {
    const { firstName, lastName, handle, location, timezone } = req.body;

    for (const field of [
      "firstName",
      "lastName",
      "handle",
      "location",
      "timezone",
    ])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    const data = {
      given_name: firstName,
      family_name: lastName,
      name: `${firstName} ${lastName}`,
      nickname: handle,
      user_metadata: { location: location, timezone: timezone },
    };

    // Get a token for sending requests to the Auth0 Management Api
    AuthService.getManagementApiJwt()
      .then((tokenRes) => {
        const token = tokenRes.data.access_token;

        axios
          .patch(
            "https://isgood-webapp.us.auth0.com/api/v2/users/" + req.user.sub,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((managementApiRes) => {
            res.status(201).json(managementApiRes.data);
          })
          .catch((err) => {
            // error handling here needs to be looked at in the future
            console.log(err.response.data);
            res.status(err.response.data.statusCode).json(err.response.data);
          });
      })
      .catch((err) => {
        // error handling here needs to be looked at in the future
        console.log(err.response);
        res.status(err.response.status).json(err.response.data);
      });
  });

module.exports = usersRouter;
