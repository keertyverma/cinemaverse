import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import config from "config";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Cinemaverse API.");
});

app.listen(PORT, () => {
  console.log(console.log(`App listening at http://localhost:${PORT}`));
  console.log("NODE Env = ", process.env.NODE_ENV);
  console.log("host = ", config.get("host"));
});
