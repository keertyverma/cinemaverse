import { Request, Response } from "express";
import logger from "../logger";

const getAllMovies = (req: Request, res: Response) => {
  logger.debug(req.baseUrl);
  res.send("get all movies");
};

export { getAllMovies };
