import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import tmdb from "../utils/tmdb.js";

async function seedGenres() {
  const { data } = await tmdb.get("/genre/movie/list", {
    params: { language: "en-US" },
  });
  for (const g of data.genres as Array<{ id: number; name: string }>) {
    await prisma.genre.upsert({
      where: { id: g.id },
      update: { name: g.name },
      create: { id: g.id, name: g.name },
    });
  }
  console.log("✅ Seeded genres");
}

async function seedList(endpoint: string, pages = 3) {
  for (let page = 1; page <= pages; page++) {
    const { data } = await tmdb.get(endpoint, {
      params: { language: "en-US", page },
    });
    const items = data.results as any[];
    for (const m of items) {
      await prisma.movie.upsert({
        where: { id: m.id },
        update: {
          title: m.title || m.name,
          overview: m.overview || "",
          poster_path: m.poster_path || null,
          backdrop_path: m.backdrop_path || null,
          release_date: m.release_date ? new Date(m.release_date) : null,
          vote_average: m.vote_average ?? 0,
          vote_count: m.vote_count ?? 0,
          popularity: m.popularity ?? 0,
          adult: !!m.adult,
          original_language: m.original_language || null,
          genres: {
            // reset-and-set (cách đơn giản: disconnectAll + connect)
            set: [],
            connect: (m.genre_ids || []).map((gid: number) => ({ id: gid })),
          },
        },
        create: {
          id: m.id,
          title: m.title || m.name,
          overview: m.overview || "",
          poster_path: m.poster_path || null,
          backdrop_path: m.backdrop_path || null,
          release_date: m.release_date ? new Date(m.release_date) : null,
          vote_average: m.vote_average ?? 0,
          vote_count: m.vote_count ?? 0,
          popularity: m.popularity ?? 0,
          adult: !!m.adult,
          original_language: m.original_language || null,
          genres: {
            connect: (m.genre_ids || []).map((gid: number) => ({ id: gid })),
          },
        },
      });
    }
    console.log(`✅ Seeded ${endpoint} page ${page}`);
  }
}

async function main() {
  await seedGenres();
  await seedList("/movie/popular", 3);
  await seedList("/movie/top_rated", 3);
  await seedList("/movie/now_playing", 2);
  await seedList("/movie/upcoming", 2);
  console.log("🎉 Done seeding");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
