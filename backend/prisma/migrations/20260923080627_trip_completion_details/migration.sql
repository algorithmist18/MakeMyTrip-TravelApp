-- CreateTable
CREATE TABLE "ExtraActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExtraActivity_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TripPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "day" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visited" BOOLEAN NOT NULL DEFAULT true,
    "addedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripPlace_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TripPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TripPlace_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TripPlace" ("addedById", "createdAt", "day", "id", "order", "placeId", "tripId") SELECT "addedById", "createdAt", "day", "id", "order", "placeId", "tripId" FROM "TripPlace";
DROP TABLE "TripPlace";
ALTER TABLE "new_TripPlace" RENAME TO "TripPlace";
CREATE UNIQUE INDEX "TripPlace_tripId_placeId_key" ON "TripPlace"("tripId", "placeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
