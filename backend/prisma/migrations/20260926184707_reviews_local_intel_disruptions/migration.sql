-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "tripType" TEXT NOT NULL,
    "visitedMonth" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LocalIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "destination" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tip" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Disruption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Disruption_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisruptionAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disruptionId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DisruptionAction_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "Disruption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
