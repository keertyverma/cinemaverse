import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi, { ObjectSchema } from "joi";
import { Types } from "mongoose";

import logger from "../logger";
import { Movie, IMovie, Genre } from "../models";
import BadRequestError from "../errors/bad-request";
import { APIResponse } from "../types/api-response";
import NotFoundError from "../errors/not-found";
import { mongoIdValidator } from "../helper/joi-custom-types";

const getAllMovies = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const movies = await Movie.find().select({ __v: 0 });
  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movies,
  };
  res.status(StatusCodes.OK).json(result);
};

const validateMovie = (movie: IMovie) => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().required(),
    genreIds: Joi.array().items(mongoIdValidator.mongoId()),
    releaseDate: Joi.date(),
    posterURL: Joi.string(),
  });

  return schema.validate(movie);
};

const _getGenres = async (genreIds: []) => {
  // fetch genres by id
  const genres = await Genre.find({
    _id: {
      $in: genreIds,
    },
  }).select("name");

  const fetchedIds = genres.map((genre) => genre._id.toString());
  const missingIds = genreIds.filter((id) => !fetchedIds.includes(id));

  if (missingIds?.length > 0) {
    throw new NotFoundError(`Genre Ids = ${missingIds} are not found`);
  }

  return genres;
};

const createMovie = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateMovie(req.body);
  if (error) {
    logger.error(`Input Validation Error! \n ${error.details[0].message}`);
    throw new BadRequestError(error.details[0].message);
  }

  // create movie object
  const { name, genreIds, releaseDate, posterURL } = req.body;
  const movie = new Movie({
    name,
    posterURL,
    releaseDate,
  });

  if (genreIds?.length > 0) {
    movie.genres = await _getGenres(genreIds);
  }

  // store movie in db
  await movie.save();

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.CREATED,
    data: movie,
  };
  res.status(StatusCodes.CREATED).json(result);
};

const getMovieById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get movie by id
  const movie = await Movie.findById(id).select({ __v: 0 });
  if (!movie) {
    throw new NotFoundError(`Movie with id = ${id} is not found.`);
  }

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movie,
  };
  res.status(StatusCodes.OK).json(result);
};

const validateUpdateMovie = (movie: IMovie) => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string(),
    genreIds: Joi.array().items(mongoIdValidator.mongoId()),
    releaseDate: Joi.date(),
    posterURL: Joi.string(),
  });

  return schema.validate(movie);
};

const updateMovieById = async (req: Request, res: Response) => {
  logger.debug(`PATCH movie request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // validate request body
  const { error } = validateUpdateMovie(req.body);
  if (error) {
    logger.error(`Input Validation Error! \n ${error.details[0].message}`);
    throw new BadRequestError(error.details[0].message);
  }

  // check if movie exists and then update the movie
  const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedMovie) {
    throw new NotFoundError(`Movie with id = ${id} is not found.`);
  }

  //TODO: update genres

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: updatedMovie,
  };
  res.status(200).json(result);
};

const deleteMovieById = async (req: Request, res: Response) => {
  logger.debug(`DELETE movie request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  const deletedMovie = await Movie.findByIdAndDelete(id);

  if (!deletedMovie) {
    throw new NotFoundError(`Movie with id = ${id} is not found.`);
  }

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: deletedMovie,
  };
  res.status(200).json(result);
};

export {
  getAllMovies,
  createMovie,
  getMovieById,
  updateMovieById,
  deleteMovieById,
};
