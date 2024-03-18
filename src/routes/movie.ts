import { Router } from "express";
import {
  getAllMovies,
  createMovie,
  getMovieById,
  updateMovieById,
} from "../controllers/movie";

const router = Router();

router.get("/", getAllMovies);
router.post("/", createMovie);
router.get("/:id", getMovieById);
router.patch("/:id", updateMovieById);

export default router;
