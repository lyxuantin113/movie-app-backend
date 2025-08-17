import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/genres  -> trả về giống TMDB: { genres: [{id, name}, ...] }
router.get("/", async (_req, res) => {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  res.json({ genres });
});

export default router;
