import { Router } from "express";
import { getAllGenre, createGenre } from "../controllers/genre";

const router = Router();

router.route("/").get(getAllGenre).post(createGenre);

export default router;
