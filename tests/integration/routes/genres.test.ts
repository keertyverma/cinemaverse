import request from "supertest";
import { disconnect } from "mongoose";
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
});
