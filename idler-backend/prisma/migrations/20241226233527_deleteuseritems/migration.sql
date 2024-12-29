/*
  Warnings:

  - You are about to drop the `UserItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserItems";
PRAGMA foreign_keys=on;

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameRootId" INTEGER NOT NULL,
    CONSTRAINT "GameItems_gameRootId_fkey" FOREIGN KEY ("gameRootId") REFERENCES "GameRoot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameItems" ("amount", "createdAt", "gameRootId", "id", "name", "order") SELECT "amount", "createdAt", "gameRootId", "id", "name", "order" FROM "GameItems";
DROP TABLE "GameItems";
ALTER TABLE "new_GameItems" RENAME TO "GameItems";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
