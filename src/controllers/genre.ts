import { Request, Response } from "express";
import { APIResponse } from "../types/api-response";
import { StatusCodes } from "http-status-codes";

import { Genre, IGenre } from "../models";
import logger from "../logger";
import Joi, { ObjectSchema } from "joi";
import BadRequestError from "../errors/bad-request";
import { Types } from "mongoose";
import NotFoundError from "../errors/not-found";

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

const validateGenre = (genre: IGenre) => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().required(),
  });

  return schema.validate(genre);
};

const createGenre = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateGenre(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  // create genre object
  const { name } = req.body;
  let genre = new Genre({
    name,
  });

  // store in db
  await genre.save();

  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.CREATED,
    data: genre,
  };
  res.status(result.statusCode).json(result);
};

const getGenreById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get genre by id
  const genre = await Genre.findById(id).select({ __v: 0 });

  if (!genre) {
    throw new NotFoundError(`Genre with id = ${id} is not found.`);
  }
  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: genre,
  };
  res.status(result.statusCode).json(result);
};

const validateUpdateGenre = (genre: IGenre) => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string(),
  });

  return schema.validate(genre);
};

const updateGenreById = async (req: Request, res: Response) => {
  logger.debug(`PATCH genre request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // validate request body
  const { error } = validateUpdateGenre(req.body);
  if (error) {
    logger.error(`Input Validation Error! \n ${error.details[0].message}`);
    throw new BadRequestError(error.details[0].message);
  }

  // check if genre exists and then update the genre
  const updatedGenre = await Genre.findByIdAndUpdate(id, req.body, {
    new: true,
  }).select({ __v: 0 });
  if (!updatedGenre) {
    throw new NotFoundError(`Genre with id = ${id} is not found.`);
  }

  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: updatedGenre,
  };
  res.status(200).json(result);
};

const deleteGenreById = async (req: Request, res: Response) => {
  logger.debug(`DELETE genre request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  const deletedGenre = await Genre.findByIdAndDelete(id);

  if (!deletedGenre) {
    throw new NotFoundError(`Genre with id = ${id} is not found.`);
  }

  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: deletedGenre,
  };
  res.status(result.statusCode).json(result);
};

export {
  getAllGenre,
  createGenre,
  getGenreById,
  updateGenreById,
  deleteGenreById,
};
