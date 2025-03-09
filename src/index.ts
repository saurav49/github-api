import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { userByNameUrl } from "./consts/urls";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const username = process?.env.USERNAME || "";

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

app.get("/github", async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${userByNameUrl}${username}`);
    const data = await response.json();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "unable to fetch data",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
