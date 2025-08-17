-- DropIndex
DROP INDEX "public"."Movie_popularity_idx";

-- DropIndex
DROP INDEX "public"."Movie_release_date_idx";

-- DropIndex
DROP INDEX "public"."Movie_vote_average_idx";

-- AlterTable
ALTER TABLE "public"."Genre" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Movie" ALTER COLUMN "poster_path" SET DATA TYPE TEXT,
ALTER COLUMN "backdrop_path" SET DATA TYPE TEXT,
ALTER COLUMN "original_language" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(190) NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FavoritesOnUsers" (
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritesOnUsers_pkey" PRIMARY KEY ("userId","movieId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "FavoritesOnUsers_movieId_idx" ON "public"."FavoritesOnUsers"("movieId");

-- AddForeignKey
ALTER TABLE "public"."FavoritesOnUsers" ADD CONSTRAINT "FavoritesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoritesOnUsers" ADD CONSTRAINT "FavoritesOnUsers_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
