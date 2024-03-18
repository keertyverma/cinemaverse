import { Router } from "express";
import {
  getAllMovies,
  createMovie,
  getMovieById,
  updateMovieById,
  deleteMovieById,
} from "../controllers/movie";

const router = Router();

router.route("/").get(getAllMovies).post(createMovie);

router
  .route("/:id")
  .get(getMovieById)
  .patch(updateMovieById)
  .delete(deleteMovieById);

export default router;
