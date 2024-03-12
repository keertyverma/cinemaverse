import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import config from "config";

import logger from "./logger";
import appRouter from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(`/${config.get("app_name")}/api`, appRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Cinemaverse API.");
});

app.listen(PORT, () => {
  logger.info(`App listening at http://localhost:${PORT}`);
  logger.debug(`NODE Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("app_name")}`);
});
