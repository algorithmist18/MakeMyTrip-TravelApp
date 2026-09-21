import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

function dayCount(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

router.get("/:year", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const year = Number(req.params.year);
  if (!Number.isInteger(year)) return res.status(400).json({ error: "Invalid year" });

  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const trips = await prisma.trip.findMany({
    where: {
      status: "completed",
      completedAt: { not: null },
      startDate: { gte: start, lt: end },
      OR: [{ creatorId: userId }, { collaborators: { some: { userId } } }],
    },
    orderBy: { startDate: "asc" },
  });

  const cities = new Set(trips.map((t) => t.destination));
  const totalDays = trips.reduce((sum, t) => sum + dayCount(t.startDate, t.endDate), 0);
  const styleCounts: Record<string, number> = {};
  for (const t of trips) styleCounts[t.travelStyle] = (styleCounts[t.travelStyle] ?? 0) + 1;
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const circuit = trips
    .filter((t) => t.destinationLat != null && t.destinationLng != null)
    .map((t) => ({
      tripId: t.id,
      title: t.title,
      destination: t.destination,
      lat: t.destinationLat as number,
      lng: t.destinationLng as number,
      startDate: t.startDate,
    }));

  res.json({
    year,
    stats: {
      tripsCompleted: trips.length,
      citiesVisited: cities.size,
      totalDays,
      topTravelStyle: topStyle,
    },
    circuit,
    trips: trips.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      startDate: t.startDate,
      endDate: t.endDate,
      travelStyle: t.travelStyle,
    })),
  });
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const rows = await prisma.trip.findMany({
    where: {
      status: "completed",
      OR: [{ creatorId: userId }, { collaborators: { some: { userId } } }],
    },
    select: { startDate: true },
  });
  const years = Array.from(new Set(rows.map((r) => r.startDate.getUTCFullYear()))).sort((a, b) => b - a);
  res.json({ years });
});

export default router;
