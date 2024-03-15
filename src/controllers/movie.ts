import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi, { ObjectSchema } from "joi";

import logger from "../logger";
import { Movie, Genre, IMovie } from "../models/movie";
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
  res.status(StatusCodes.OK).send(result);
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
  res.status(StatusCodes.CREATED).send(result);
};

export { getAllMovies, createMovie };
