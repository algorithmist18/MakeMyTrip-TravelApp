import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import {
  addPlaceToTrip,
  completeTrip,
  estimateDailySpend,
  getFullTrip,
  isTripMember,
  removePlaceFromTrip,
  reorderTripPlaces,
} from "../services/tripService";
import { emitToTrip } from "../sockets/bus";

const router = Router();

const TRAVEL_STYLES = ["luxury", "chill", "romantic", "family", "cost-saving", "backpacking"] as const;
const travelStyleSchema = z.enum(TRAVEL_STYLES);

function serializeTrip(trip: NonNullable<Awaited<ReturnType<typeof getFullTrip>>>) {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    destinationLat: trip.destinationLat,
    destinationLng: trip.destinationLng,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelStyle: trip.travelStyle,
    travelerCount: trip.travelerCount,
    status: trip.status,
    completedAt: trip.completedAt,
    askedCompletion: trip.askedCompletion,
    creator: trip.creator,
    collaborators: trip.collaborators.map((c) => c.user),
    dailySpendEstimate: estimateDailySpend(trip.travelStyle, trip.travelerCount),
    itinerary: trip.places.map((tp) => ({
      tripPlaceId: tp.id,
      day: tp.day,
      order: tp.order,
      visited: tp.visited,
      addedBy: tp.addedBy,
      place: tp.place,
    })),
    extraActivities: trip.extraActivities.map((a) => ({
      id: a.id,
      title: a.title,
      createdAt: a.createdAt,
    })),
  };
}

async function loadAndAuthorize(tripId: string, userId: string) {
  const member = await isTripMember(tripId, userId);
  if (!member) return null;
  return getFullTrip(tripId);
}

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const trips = await prisma.trip.findMany({
    where: { OR: [{ creatorId: userId }, { collaborators: { some: { userId } } }] },
    orderBy: { startDate: "desc" },
    include: {
      creator: { select: { id: true, name: true, email: true, avatarColor: true } },
      collaborators: { include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } } },
      places: { include: { place: true, addedBy: { select: { id: true, name: true, avatarColor: true } } } },
      extraActivities: { orderBy: { createdAt: "asc" } },
    },
  });
  res.json({ trips: trips.map((t) => serializeTrip(t)) });
});

const createTripSchema = z.object({
  title: z.string().min(1).max(120),
  destination: z.string().min(1).max(80),
  destinationLat: z.number().optional(),
  destinationLng: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  travelStyle: travelStyleSchema.default("cost-saving"),
  travelerCount: z.number().int().min(1).max(30).default(1),
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createTripSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const data = parsed.data;
  const trip = await prisma.trip.create({
    data: {
      title: data.title,
      destination: data.destination.toLowerCase().trim(),
      destinationLat: data.destinationLat,
      destinationLng: data.destinationLng,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      travelStyle: data.travelStyle,
      travelerCount: data.travelerCount,
      creatorId: req.userId!,
    },
  });
  const full = await getFullTrip(trip.id);
  res.status(201).json({ trip: serializeTrip(full!) });
});

router.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const trip = await loadAndAuthorize(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json({ trip: serializeTrip(trip) });
});

const updateTripSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  travelStyle: travelStyleSchema.optional(),
  travelerCount: z.number().int().min(1).max(30).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.id, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const parsed = updateTripSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const data = parsed.data;
  await prisma.trip.update({
    where: { id: req.params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.travelStyle !== undefined && { travelStyle: data.travelStyle }),
      ...(data.travelerCount !== undefined && { travelerCount: data.travelerCount }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
    },
  });
  const full = await getFullTrip(req.params.id);
  const serialized = serializeTrip(full!);
  emitToTrip(req.params.id, "trip_updated", serialized);
  res.json({ trip: serialized });
});

router.post("/:id/collaborators", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.id, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const email = String(req.body?.email ?? "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "email is required" });

  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) return res.status(404).json({ error: "No user found with that email" });

  await prisma.tripCollaborator.upsert({
    where: { tripId_userId: { tripId: req.params.id, userId: invitee.id } },
    update: {},
    create: { tripId: req.params.id, userId: invitee.id },
  });

  const full = await getFullTrip(req.params.id);
  const serialized = serializeTrip(full!);
  emitToTrip(req.params.id, "trip_updated", serialized);
  res.status(201).json({ trip: serialized });
});

router.post("/:id/places", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.id, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const placeId = String(req.body?.placeId ?? "");
  const day = Number(req.body?.day ?? 1);
  if (!placeId) return res.status(400).json({ error: "placeId is required" });

  await addPlaceToTrip(req.params.id, placeId, req.userId!, day);
  const full = await getFullTrip(req.params.id);
  const serialized = serializeTrip(full!);
  emitToTrip(req.params.id, "trip_updated", serialized);
  res.status(201).json({ trip: serialized });
});

router.delete("/:id/places/:tripPlaceId", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.id, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  await removePlaceFromTrip(req.params.id, req.params.tripPlaceId);
  const full = await getFullTrip(req.params.id);
  const serialized = serializeTrip(full!);
  emitToTrip(req.params.id, "trip_updated", serialized);
  res.json({ trip: serialized });
});

const reorderSchema = z.object({
  items: z.array(
    z.object({
      tripPlaceId: z.string(),
      day: z.number().int().min(1),
      order: z.number().int().min(0),
    })
  ),
});

router.patch("/:id/places/reorder", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.id, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid reorder payload" });

  const full = await reorderTripPlaces(req.params.id, parsed.data.items);
  const serialized = serializeTrip(full!);
  emitToTrip(req.params.id, "trip_updated", serialized);
  res.json({ trip: serialized });
});

const completeSchema = z.object({
  didYouDoIt: z.boolean(),
  visitedTripPlaceIds: z.array(z.string()).optional(),
  extraActivities: z.array(z.string().min(1).max(80)).max(20).optional(),
});

router.post("/:id/complete", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.id, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const full = await completeTrip(req.params.id, parsed.data);
  if (!full) return res.status(404).json({ error: "Trip not found" });
  const serialized = serializeTrip(full);
  emitToTrip(req.params.id, "trip_updated", serialized);
  res.json({ trip: serialized });
});

export default router;
