import request from "supertest";
import { disconnect } from "mongoose";
import http from "http";

import app from "../../../app";
import { IMovie, Movie } from "../../../src/models/movie";
import config from "config";

let server: http.Server;

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

      const res = await request(server).get(
        `/${config.get("appName")}/api/movies`
      );

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
});
