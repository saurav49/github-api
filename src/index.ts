import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { userByNameUrl, repoByNameUrl } from "./consts/urls";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const username = process?.env.GITHUB_USERNAME || "";

app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

app.get("/github", async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${userByNameUrl}/${username}`);
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

app.get("/github/:repo_name", async (req: Request, res: Response) => {
  const { repo_name } = req.params;
  const repoUrl = `${repoByNameUrl}/${username}/${repo_name}`;
  try {
    const response = await fetch(repoUrl);
    if (!response.ok) {
      res.status(404).json({
        success: false,
        message: "Repository not found",
      });
    }
    const data = await response.json();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch data from GitHub",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
