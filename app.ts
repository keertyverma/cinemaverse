import "express-async-errors";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import config from "config";
import { connect } from "mongoose";

import logger from "./logger";
import appRouter from "./routes";
import errorHandler from "./middlewares/error-handler";
import routeNotFoundHandler from "./middlewares/route-not-found";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// add middleware
app.use(express.json());

// Configure app routes
app.use(`/${config.get("app_name")}/api`, appRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Cinemaverse API.");
});

// Connect to MongoDB
connect(`${MONGO_URI}`)
  .then(() => {
    logger.info(`Successfully Connected to MongoDB - ${MONGO_URI}`);
  })
  .catch((err) => {
    logger.info(`Connection Fails for MongoDB - ${MONGO_URI} \n ${err}`);
  });

// error handler middleware
app.use(routeNotFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`App listening at http://localhost:${PORT}`);
  logger.debug(`NODE Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("app_name")}`);
});
