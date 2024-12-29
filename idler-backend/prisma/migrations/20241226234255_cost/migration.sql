/*
  Warnings:

  - Added the required column `cost` to the `GameItems` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "adder" REAL NOT NULL DEFAULT 1,
    "multiplier" REAL NOT NULL DEFAULT 1,
    "cost" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameRootId" INTEGER NOT NULL,
    CONSTRAINT "GameItems_gameRootId_fkey" FOREIGN KEY ("gameRootId") REFERENCES "GameRoot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameItems" ("adder", "amount", "createdAt", "gameRootId", "id", "multiplier", "name", "order") SELECT "adder", "amount", "createdAt", "gameRootId", "id", "multiplier", "name", "order" FROM "GameItems";
DROP TABLE "GameItems";
ALTER TABLE "new_GameItems" RENAME TO "GameItems";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
