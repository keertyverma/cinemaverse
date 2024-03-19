import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import app from "../../../app";
import { Genre, IGenre } from "../../../src/models";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/genres`;

describe("/api/genres", () => {
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(() => {
    server = app;
  });

  afterEach(async () => {
    server.close();
    // db cleanup
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      // populate 2 genre documents
      const genres = await Genre.create([
        {
          name: "action",
        },
        {
          name: "romantic",
        },
      ]);

      const res = await request(server).get(endpoint);
      const responseData = res.body.data;

      expect(res.statusCode).toBe(200);
      expect(responseData.length).toBe(genres.length);
      expect(
        responseData.some((genre: IGenre) => genre.name === "Action")
      ).toBeTruthy();
      expect(
        responseData.some((genre: IGenre) => genre.name === "Romantic")
      ).toBeTruthy();
    });
  });

  describe("POST /", () => {
    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // name is the required parameter to create movie.
      const res = await request(server)
        .post(endpoint)
        .send({ names: "genre-1" });
      console.log(res.body.error);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"name" is required',
      });
    });

    it("should return BadRequest-400 if request body is invalid", async () => {
      // passing some parameter in request body which is not allowed
      const res = await request(server).post(endpoint).send({
        name: "genre-1",
        randomParam: "this parameter is not allowed",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"randomParam" is not allowed',
      });
    });

    it("should return BadRequest-400 if duplicate genre name is passed", async () => {
      // create genre with the same name as passed in request body
      await Genre.create({
        name: "action",
      });

      const genreData = {
        name: "action",
      };
      const res = await request(server).post(endpoint).send(genreData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          "Duplicate value entered for 'name' field, please choose another value",
      });
    });

    it("should create genre if request is valid", async () => {
      const res = await request(server).post(endpoint).send({ name: "action" });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.name).toBe("Action"); // genre name should is capitalized
    });
  });

  describe("GET /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const genreId = "123";
      const res = await request(server).get(`${endpoint}/${genreId}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${genreId}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      // can not find genre by given id
      const id = new Types.ObjectId().toString();
      const res = await request(server).get(`${endpoint}/${id}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre with id = ${id} is not found.`,
      });
    });

    it("should return genre by passing id", async () => {
      // create a genre
      const genre = await Genre.create({
        name: "action",
      });
      const res = await request(server).get(`${endpoint}/${genre.id}`);
      const responseData = res.body.data;
      expect(res.statusCode).toBe(200);
      expect(responseData._id).toBe(genre.id);
      expect(responseData.name).toBe("Action");
    });
  });
});
