-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameRoot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "multiplier" REAL NOT NULL DEFAULT 1,
    "permanent_multiplier" REAL NOT NULL DEFAULT 1,
    "ascension" INTEGER NOT NULL DEFAULT 0,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT
);
INSERT INTO "new_GameRoot" ("ascension", "id", "multiplier", "permanent_multiplier") SELECT "ascension", "id", "multiplier", "permanent_multiplier" FROM "GameRoot";
DROP TABLE "GameRoot";
ALTER TABLE "new_GameRoot" RENAME TO "GameRoot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
