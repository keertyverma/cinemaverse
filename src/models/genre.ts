import { Schema, model } from "mongoose";
import * as _ from "lodash";

// Create an interface representing a document in MongoDB
export interface IGenre {
  name: string;
}

// Create a Schema corresponding to the document interface
const genreSchema = new Schema<IGenre>({
  name: {
    type: String,
    required: [true, "'name' field is required."],
    unique: true,
    get: (v: string) => _.capitalize(v),
    set: (v: string) => _.capitalize(v),
    trim: true,
  },
});

// Create a Model
export const Genre = model("Genre", genreSchema);
