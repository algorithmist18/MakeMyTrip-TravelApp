/*
  Warnings:

  - Added the required column `planName` to the `Disruption` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Disruption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "totalCostDelta" INTEGER NOT NULL DEFAULT 0,
    "costNote" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Disruption_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Disruption" ("createdAt", "id", "label", "scenarioType", "status", "summary", "tripId") SELECT "createdAt", "id", "label", "scenarioType", "status", "summary", "tripId" FROM "Disruption";
DROP TABLE "Disruption";
ALTER TABLE "new_Disruption" RENAME TO "Disruption";
CREATE TABLE "new_DisruptionAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disruptionId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "costDelta" INTEGER NOT NULL DEFAULT 0,
    "costNote" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DisruptionAction_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "Disruption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DisruptionAction" ("detail", "disruptionId", "icon", "id", "order", "outcome", "status", "title") SELECT "detail", "disruptionId", "icon", "id", "order", "outcome", "status", "title" FROM "DisruptionAction";
DROP TABLE "DisruptionAction";
ALTER TABLE "new_DisruptionAction" RENAME TO "DisruptionAction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
