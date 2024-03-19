import { Router } from "express";
import { getAllGenre } from "../controllers/genre";

const router = Router();

router.get("/", getAllGenre);

export default router;
