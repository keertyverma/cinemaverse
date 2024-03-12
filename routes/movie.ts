import { Router } from "express";
import { getAllMovies, createMovie } from "../controllers/movie";

const router = Router();

router.get("/", getAllMovies);
router.post("/", createMovie);

export default router;
