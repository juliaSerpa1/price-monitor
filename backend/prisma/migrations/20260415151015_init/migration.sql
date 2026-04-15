/*
  Warnings:

  - You are about to alter the column `vector` on the `Embedding` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector")`.

*/
-- AlterTable
ALTER TABLE "Embedding" ALTER COLUMN "vector" SET DATA TYPE vector;
