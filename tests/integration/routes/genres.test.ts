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
      // name is the required parameter to create genre.
      const res = await request(server)
        .post(endpoint)
        .send({ names: "genre-1" });
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

  describe("PATCH /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      // "id" should be of mongoDB object ID format like 65f415f9fa340f3183c8a44e
      const id = "123";
      const res = await request(server).patch(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return BadRequest-400 if request body is invalid", async () => {
      // "genreName" parameter passed on request body is wrong and not allowed
      const toUpdate = {
        genreName: "new genre",
      };
      const id = new Types.ObjectId().toString();

      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"genreName" is not allowed',
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      // genre is not found with given "id"
      const id = new Types.ObjectId().toString();
      const toUpdate = {
        name: "genre-2",
      };

      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre with id = ${id} is not found.`,
      });
    });

    it("should update genre by passing valid data", async () => {
      // create a genre
      const genre = await Genre.create({
        name: "actions",
      });

      // update genre
      const toUpdate = { name: "action" };
      const res = await request(server)
        .patch(`${endpoint}/${genre.id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(200);

      const responseData = res.body.data;
      expect(responseData._id).toBe(genre.id);
      expect(responseData.name).toBe("Action");
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
      const id = new Types.ObjectId().toString();
      const res = await request(server).delete(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre with id = ${id} is not found.`,
      });
    });

    it("should delete genre by passing valid id", async () => {
      // create a genre
      const genre = await Genre.create({
        name: "action",
      });

      // delete genre
      const res = await request(server).delete(`${endpoint}/${genre.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(genre.id);

      // confirm if genre is deleted from db
      const deletedGenre = await Genre.findById(genre.id);
      expect(deletedGenre).toBeNull;
    });
  });
});
