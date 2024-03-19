import { Router } from "express";
import {
  getAllGenre,
  createGenre,
  getGenreById,
  updateGenreById,
  deleteGenreById,
} from "../controllers/genre";

const router = Router();

router.route("/").get(getAllGenre).post(createGenre);
router
  .route("/:id")
  .get(getGenreById)
  .patch(updateGenreById)
  .delete(deleteGenreById);

export default router;
