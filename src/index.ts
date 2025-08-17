import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pino from "pino";

import genresRouter from "./routes/genres.js";
import moviesRouter from "./routes/movies.js";

import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";

const app = express();
const logger = pino(
  process.env.NODE_ENV === "production"
    ? undefined
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      }
);

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true, // ⚠️ cho phép cookie cross-site
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API routes
app.use("/api/genres", genresRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/favorites", favoritesRouter);

// app.use("/api/tv", tvRouter); // mở rộng sau

// Auth
app.use("/api/auth", authRouter);

// Start server
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => logger.info(`🚀 API ready at http://localhost:${PORT}`));
