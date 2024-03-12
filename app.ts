import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import config from "config";

import logger from "./logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Cinemaverse API.");
});

app.listen(PORT, () => {
  logger.info(`App listening at http://localhost:${PORT}`);
  logger.debug(`NODE Env = ${process.env.NODE_ENV}`);
  logger.debug(`Host = ${config.get("host")}`);
});
