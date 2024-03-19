import { Router } from "express";
import { getAllGenre, createGenre, getGenreById } from "../controllers/genre";

const router = Router();

router.route("/").get(getAllGenre).post(createGenre);
router.route("/:id").get(getGenreById);

export default router;
