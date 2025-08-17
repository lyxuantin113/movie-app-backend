import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).user.id as number;
  const rows = await prisma.favoritesOnUsers.findMany({
    where: { userId },
    include: { movie: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ results: rows.map((r) => r.movie) });
});

router.post("/:movieId", requireAuth, async (req, res) => {
  const userId = (req as any).user.id as number;
  const movieId = Number(req.params.movieId);
  await prisma.favoritesOnUsers.upsert({
    where: { userId_movieId: { userId, movieId } },
    create: { userId, movieId },
    update: {},
  });
  res.json({ ok: true });
});

router.delete("/:movieId", requireAuth, async (req, res) => {
  const userId = (req as any).user.id as number;
  const movieId = Number(req.params.movieId);
  await prisma.favoritesOnUsers.delete({
    where: { userId_movieId: { userId, movieId } },
  });
  res.json({ ok: true });
});

export default router;
