/*
  Warnings:

  - You are about to drop the `JobImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobImage" DROP CONSTRAINT "JobImage_post_id_fkey";

-- DropTable
DROP TABLE "JobImage";

-- CreateTable
CREATE TABLE "PostImage" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "imageKey" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;
