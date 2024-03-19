import request from "supertest";
import { Types, disconnect } from "mongoose";
import http from "http";

import app from "../../../app";
import { Genre, IMovie, Movie } from "../../../src/models";
import config from "config";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/movies`;

describe("/api/movies", () => {
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(async () => {
    server = app;
  });

  afterEach(async () => {
    server.close();
    // db cleanup
    await Movie.deleteMany({});
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all movies", async () => {
      //populate DB by adding 2 movies
      await Movie.insertMany([
        {
          name: "movie 1",
        },
        {
          name: "movie 2",
        },
      ]);

      const res = await request(server).get(endpoint);

      expect(res.statusCode).toBe(200);

      const responseData = res.body.data;
      expect(responseData.length).toBe(2);

      expect(
        responseData.some((movie: IMovie) => movie.name === "Movie 1")
      ).toBeTruthy();
      expect(
        responseData.some((movie: IMovie) => movie.name === "Movie 2")
      ).toBeTruthy();
    });
  });

  describe("POST /", () => {
    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // name is the required parameter to create movie.
      const movieData = {
        moviename: "Movie 1",
      };
      const res = await request(server).post(endpoint).send(movieData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"name" is required',
      });
    });
    it("should return BadRequest-400 if duplicate movie name is passed", async () => {
      // create movie with the same name as passed in request body
      await Movie.create({
        name: "new movie",
      });

      const movieData = {
        name: "new movie",
      };
      const res = await request(server).post(endpoint).send(movieData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          "Duplicate value entered for 'name' field, please choose another value",
      });
    });

    it("should return BadRequest-400 if genreIds data format is wrong", async () => {
      // genreIds parameter accepts array of id which is in format of mongodb objectIds
      const movieData = {
        name: "new movie",
        genreIds: ["1234"],
      };
      const res = await request(server).post(endpoint).send(movieData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"genreIds[0]" must be a valid MongoDB ObjectId',
      });
    });

    it("should return BadRequest-400 if genreIds is not found", async () => {
      // this genre is not present in DB
      const genreId = new Types.ObjectId().toString();

      const movieData = {
        name: "new movie",
        genreIds: [genreId],
      };
      const res = await request(server).post(endpoint).send(movieData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre Ids = ${genreId} are not found`,
      });
    });

    it("should create movie if request is valid", async () => {
      // create genre
      const genre = await Genre.create({
        name: "Action",
      });

      const movieData = {
        name: "new movie",
        genreIds: [genre._id],
      };
      const res = await request(server).post(endpoint).send(movieData);
      const { name, genres } = res.body.data;

      expect(res.statusCode).toBe(201);
      expect(name).toBe("New movie"); // movie name should is capitalized
      expect(genres.length).toBe(1);
      expect(genres[0]).toMatchObject({ name: genre.name, _id: genre.id });
    });
  });

  describe("GET /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const id = "skdksf";
      const res = await request(server).get(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      const id = "65f415f9fa340f3183c8a44e";
      const res = await request(server).get(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Movie with id = ${id} is not found.`,
      });
    });

    it("should return movie by passing id", async () => {
      // create a movie
      const movie = await Movie.create({
        name: "new movie",
      });

      const res = await request(server).get(`${endpoint}/${movie.id}`);
      const responseData = res.body.data;

      expect(res.statusCode).toBe(200);
      expect(responseData._id).toBe(movie.id);
      expect(responseData.name).toBe("New movie");
    });
  });

  describe("PATCH /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const id = "123";
      const res = await request(server).patch(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      const id = "65f415f9fa340f3183c8a44e";
      const res = await request(server).patch(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Movie with id = ${id} is not found.`,
      });
    });

    it("should return BadRequest-400 if request body is invalid", async () => {
      const id = "65f415f9fa340f3183c8a44e";
      const toUpdate = {
        moviename: "new movie",
      };

      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"moviename" is not allowed',
      });
    });

    it("should update movie by passing valid id", async () => {
      // create a movie
      const movie = await Movie.create({
        name: "new movie",
      });

      // update movie
      const toUpdate = { name: "updated movie" };
      const res = await request(server)
        .patch(`${endpoint}/${movie.id}`)
        .send(toUpdate);

      const responseData = res.body.data;
      expect(res.statusCode).toBe(200);
      expect(responseData._id).toBe(movie.id);
      expect(responseData.name).toBe("Updated movie");
    });
  });

  describe("DELETE /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const id = "123";
      const res = await request(server).delete(`${endpoint}/${id}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      const id = "65f415f9fa340f3183c8a44e";
      const res = await request(server).delete(`${endpoint}/${id}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Movie with id = ${id} is not found.`,
      });
    });

    it("should delete movie by passing valid id", async () => {
      // create a movie
      const movie = await Movie.create({
        name: "new movie",
      });
      const movieId = movie._id;

      // delete movie
      const res = await request(server).delete(`${endpoint}/${movieId}`);
      const responseData = res.body.data;

      expect(res.statusCode).toBe(200);
      expect(responseData._id).toBe(movie.id);

      // confirm if movie is deleted from db
      const deletedMovie = await Movie.findById(movieId);
      expect(deletedMovie).toBeNull;
    });
  });
});
