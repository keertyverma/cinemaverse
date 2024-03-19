import { Router } from "express";
import movieRouter from "./movie";
import genreRouter from "./genre";

const router = Router();
router.use("/movies", movieRouter);
router.use("/genres", genreRouter);

export default router;
