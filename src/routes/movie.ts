import { Router } from "express";
import { getAllMovies, createMovie, getMovieById } from "../controllers/movie";

const router = Router();

router.get("/", getAllMovies);
router.post("/", createMovie);
router.get("/:id", getMovieById);

export default router;
