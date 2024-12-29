-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "descrition" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "adder" REAL NOT NULL DEFAULT 0,
    "idle_adder" REAL,
    "multiplier" REAL NOT NULL DEFAULT 1,
    "cost" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameRootId" INTEGER,
    CONSTRAINT "GameItems_gameRootId_fkey" FOREIGN KEY ("gameRootId") REFERENCES "GameRoot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GameItems" ("adder", "amount", "cost", "createdAt", "descrition", "gameRootId", "id", "multiplier", "name", "order") SELECT "adder", "amount", "cost", "createdAt", "descrition", "gameRootId", "id", "multiplier", "name", "order" FROM "GameItems";
DROP TABLE "GameItems";
ALTER TABLE "new_GameItems" RENAME TO "GameItems";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
