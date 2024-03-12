import { Schema, model } from "mongoose";

// Create an interface representing a document in MongoDB
export interface IGenre {
  name: string;
}

export interface IMovie {
  name: string;
  genres: IGenre[];
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
  },
  genres: [genreSchema],
  releaseDate: Date,
  posterURL: String,
});

// Create a Model
export const Genre = model("Genre", genreSchema);
export const Movie = model("Movie", movieSchema);
