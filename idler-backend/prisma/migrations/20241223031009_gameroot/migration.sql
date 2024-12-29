/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Test";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GameRoot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "multiplier" REAL NOT NULL DEFAULT 1,
    "permanent_multiplier" REAL NOT NULL DEFAULT 1,
    "ascension" INTEGER NOT NULL DEFAULT 0
);
