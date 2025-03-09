import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { userByNameUrl, repoUrl } from "./consts/urls";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const username = process?.env.GITHUB_USERNAME || "";
const githubToken = process?.env.GITHUB_TOKEN || "";

// Middlewares
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

// GitHub user data route
app.get("/api/v1/github", async (req: Request, res: Response) => {
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
      message: "Unable to fetch data",
    });
  }
});

// GitHub repository data route
app.get("/api/v1/github/:repo_name", async (req: Request, res: Response) => {
  const { repo_name } = req.params;
  const url = `${repoUrl}/${username}/${repo_name}`;
  try {
    const response = await fetch(url);
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

// Create an issue route
app.post(
  "/api/v1/github/:repo_name/issue",
  async (req: Request, res: Response) => {
    const { repo_name } = req.params;
    const { title, body } = req.body;
    if (!title || !body) {
      res.status(400).json({
        success: false,
        message: "Title and Body are required",
      });
      return;
    }
    if (!githubToken) {
      res.status(400).json({
        success: false,
        message: "GitHub token is required",
      });
      return;
    }
    try {
      const response = await fetch(
        `${repoUrl}/${username}/${repo_name}/issues`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${githubToken}`,
          },
          body: JSON.stringify({
            owner: username,
            repo: repo_name,
            title,
            body,
          }),
        }
      );
      const data = await response.json();
      res.status(201).json({
        success: true,
        data: data?.url,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Unable to create issue",
      });
    }
  }
);

export default app;
