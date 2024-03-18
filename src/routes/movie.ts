import { Router } from "express";
import {
  getAllMovies,
  createMovie,
  getMovieById,
  updateMovieById,
  deleteMovieById,
} from "../controllers/movie";

const router = Router();

router.get("/", getAllMovies);
router.post("/", createMovie);
router.get("/:id", getMovieById);
router.patch("/:id", updateMovieById);
router.delete("/:id", deleteMovieById);

export default router;
