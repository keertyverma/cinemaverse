import { Router } from "express";
import movieRouter from "./movie";

const router = Router();
router.use("/movies", movieRouter);

export default router;
