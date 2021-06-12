require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const usersRouter = require("./routes/users-router");
const orgRouter = require("./routes/org/index");
const projectRouter = require("./routes/project/index");
const impactRouter = require("./routes/impact/index");
const outcomeRouter = require("./routes/outcome/index");
const indicatorRouter = require("./routes/indicator/index");
const imagesRouter = require("./routes/images/index");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// ------------------Router----------------------- //

app.use("/api/users", usersRouter);
app.use("/api/org", orgRouter);
app.use("/api/project", projectRouter);
app.use("/api/impact", impactRouter);
app.use("/api/outcome", outcomeRouter);
app.use("/api/indicator", indicatorRouter);
app.use("/api/images", imagesRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { message: error.message, error };
    console.log(response);
  }

  if (error.status === 401) {
    res.status(401).json(response);
  } else {
    res.status(500).json(response);
  }
});

module.exports = app;
