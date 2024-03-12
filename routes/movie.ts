import { Router } from "express";
import { getAllMovies } from "../controllers/movie";

const router = Router();

router.get("/", getAllMovies);

export default router;
