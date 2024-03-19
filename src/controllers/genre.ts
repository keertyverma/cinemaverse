import { Request, Response } from "express";
import { APIResponse } from "../types/api-response";
import { StatusCodes } from "http-status-codes";

import { Genre, IGenre } from "../models";
import logger from "../logger";

const getAllGenre = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const genres = await Genre.find().select({ __v: 0 });
  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: genres,
  };

  res.status(result.statusCode).json(result);
};

export { getAllGenre };
