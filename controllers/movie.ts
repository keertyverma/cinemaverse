import { Request, Response } from "express";
import { Error } from "mongoose";
import { StatusCodes } from "http-status-codes";
import Joi, { ObjectSchema } from "joi";

import logger from "../logger";
import { Movie, Genre, IMovie } from "../models/movie";
import BadRequestError from "../errors/bad-request";
import { APIResponse } from "../types/api-response";

const getAllMovies = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const movies = await Movie.find().select({ __v: 0 });
  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movies,
  };
  res.status(StatusCodes.OK).send(result);
};

const validateMovie = (movie: IMovie) => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().required(),
    genres: Joi.array(),
    releaseDate: Joi.date(),
    posterURL: Joi.string(),
  });

  return schema.validate(movie);
};

const _createGenres = async (genres: string[]) => {
  // TODO: check if genre already exists
  try {
    const insertGenres = genres.map((genre) => {
      return { name: genre };
    });
    return await Genre.insertMany(insertGenres);
  } catch (exception) {
    console.error(exception);
  }
};

const createMovie = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateMovie(req.body);
  if (error) {
    const result: APIResponse = {
      status: "error",
      statusCode: StatusCodes.BAD_REQUEST,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: error.details[0].message,
      },
    };

    logger.error(`Input Validation Error! \n ${error.details[0].message}`);
    throw new BadRequestError(error.details[0].message);
  }

  // create movie object
  const { name, genres, releaseDate, posterURL } = req.body;
  const movie = new Movie({
    name,
    posterURL,
    releaseDate,
  });

  // create genre
  if (genres) {
    const movieGenres = await _createGenres(genres);
    movie.genres = movieGenres ?? [];
  }

  // store movie in db
  await movie.save();

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.CREATED,
    data: movie,
  };
  res.status(StatusCodes.CREATED).send(result);
};

export { getAllMovies, createMovie };
