import { Request, Response } from "express";
import { Error } from "mongoose";
import { StatusCodes } from "http-status-codes";

import logger from "../logger";
import { Movie, Genre } from "../models/movie";

const getAllMovies = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const movies = await Movie.find().select({ __v: 0 });
  res.status(StatusCodes.OK).send({ data: movies });
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

  // TODO: validate request body

  try {
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

    res.status(StatusCodes.CREATED).send({ data: movie });
  } catch (exception) {
    if (exception instanceof Error.ValidationError) {
      const errors = [];
      for (let field in exception.errors) {
        errors.push({ message: exception.errors[field].message });
      }
      return res.status(StatusCodes.BAD_REQUEST).send({ errors });
    }

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ errors: [{ message: "Something went wrong!" }] });
  }
};

export { getAllMovies, createMovie };
