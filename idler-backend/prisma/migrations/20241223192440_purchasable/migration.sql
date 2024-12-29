/*
  Warnings:

  - Added the required column `purchasable` to the `UserItems` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchasable" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserItems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserItems" ("amount", "createdAt", "id", "name", "order", "userId") SELECT "amount", "createdAt", "id", "name", "order", "userId" FROM "UserItems";
DROP TABLE "UserItems";
ALTER TABLE "new_UserItems" RENAME TO "UserItems";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
