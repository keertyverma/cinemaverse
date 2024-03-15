import { Schema, model } from "mongoose";
import * as _ from "lodash";

// Create an interface representing a document in MongoDB
export interface IGenre {
  name: string;
}

export interface IMovie {
  name: string;
  genres?: IGenre[];
  releaseDate?: Date;
  posterURL?: string;
}

// Create a Schema corresponding to the document interface
const genreSchema = new Schema<IGenre>({
  name: {
    type: String,
    required: [true, "'name' field is required."],
  },
});

const movieSchema = new Schema<IMovie>({
  name: {
    type: String,
    required: [true, "'name' field is required."],
    unique: true,
    get: (v: string) => _.capitalize(v),
    set: (v: string) => _.capitalize(v),
    trim: true,
  },
  genres: [
    new Schema({
      name: {
        type: String,
        get: (v: string) => _.capitalize(v),
        set: (v: string) => _.capitalize(v),
        trim: true,
      },
    }),
  ],
  releaseDate: Date,
  posterURL: { type: String, trim: true },
});

// Create a Model
export const Genre = model("Genre", genreSchema);
export const Movie = model("Movie", movieSchema);
