-- CreateTable
CREATE TABLE "public"."Movie" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT NOT NULL DEFAULT '',
    "poster_path" VARCHAR(255),
    "backdrop_path" VARCHAR(255),
    "release_date" TIMESTAMP(3),
    "vote_average" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "original_language" VARCHAR(20),
    "runtime" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Genre" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MoviesOnGenres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MoviesOnGenres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Movie_release_date_idx" ON "public"."Movie"("release_date");

-- CreateIndex
CREATE INDEX "Movie_vote_average_idx" ON "public"."Movie"("vote_average");

-- CreateIndex
CREATE INDEX "Movie_popularity_idx" ON "public"."Movie"("popularity");

-- CreateIndex
CREATE INDEX "_MoviesOnGenres_B_index" ON "public"."_MoviesOnGenres"("B");

-- AddForeignKey
ALTER TABLE "public"."_MoviesOnGenres" ADD CONSTRAINT "_MoviesOnGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MoviesOnGenres" ADD CONSTRAINT "_MoviesOnGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
