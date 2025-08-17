import { Router } from "express";
import dayjs from "dayjs";
import { prisma } from "../lib/prisma.js";

const router = Router();

const selectList = {
  id: true,
  title: true,
  poster_path: true,
  backdrop_path: true,
  vote_average: true,
  vote_count: true,
  release_date: true,
  overview: true,
  popularity: true,
};

// Pagination helper
function paging(req: any) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(20, Number(req.query.pageSize) || 20);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}

// /api/movies/popular
router.get("/popular", async (req, res) => {
  const { skip, take } = paging(req);
  const results = await prisma.movie.findMany({
    orderBy: { popularity: "desc" },
    skip,
    take,
    select: selectList,
  });
  res.json({ results });
});

// /api/movies/top_rated
router.get("/top_rated", async (req, res) => {
  const { skip, take } = paging(req);
  const results = await prisma.movie.findMany({
    orderBy: [{ vote_average: "desc" }, { vote_count: "desc" }],
    skip,
    take,
    select: selectList,
  });
  res.json({ results });
});

// /api/movies/upcoming  (release_date > hôm nay)
router.get("/upcoming", async (req, res) => {
  const { skip, take } = paging(req);
  const today = dayjs().startOf("day").toDate();
  const results = await prisma.movie.findMany({
    where: { release_date: { gt: today } },
    orderBy: { release_date: "asc" },
    skip,
    take,
    select: selectList,
  });
  res.json({ results });
});

// /api/movies/now_playing (trong 90 ngày gần đây)
router.get("/now_playing", async (req, res) => {
  const { skip, take } = paging(req);
  const start = dayjs().subtract(90, "day").toDate();
  const end = dayjs().toDate();
  const results = await prisma.movie.findMany({
    where: { release_date: { gte: start, lte: end } },
    orderBy: { release_date: "desc" },
    skip,
    take,
    select: selectList,
  });
  res.json({ results });
});

// /api/movies/discover?with_genres=28,12
router.get("/discover", async (req, res) => {
  const { skip, take } = paging(req);
  const withGenres = String(req.query.with_genres || "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  const where = withGenres.length
    ? { genres: { some: { id: { in: withGenres } } } }
    : {};

  const results = await prisma.movie.findMany({
    where,
    orderBy: { popularity: "desc" },
    skip,
    take,
    select: selectList,
  });
  res.json({ results });
});

// /api/movies/search?query=batman
router.get("/search", async (req, res) => {
  const { skip, take } = paging(req);
  const q = String(req.query.query || "").trim();
  if (!q) return res.json({ results: [] });

  const results = await prisma.movie.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    orderBy: [{ popularity: "desc" }, { vote_average: "desc" }],
    skip,
    take,
    select: selectList,
  });
  res.json({ results });
});

// /api/movies/:id  -> trả object chi tiết gần giống TMDB
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { genres: { select: { id: true, name: true } } },
  });
  if (!movie)
    return res.status(404).json({ status_message: "Movie not found" });

  // chuẩn hóa shape tương tự TMDB detail (đủ cho FE hiện tại)
  res.json({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    release_date: movie.release_date,
    genres: movie.genres,
  });
});

export default router;
