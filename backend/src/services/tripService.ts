import { prisma } from "../db";

export async function isTripMember(tripId: string, userId: string): Promise<boolean> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return false;
  if (trip.creatorId === userId) return true;
  const collab = await prisma.tripCollaborator.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  return !!collab;
}

export async function getFullTrip(tripId: string) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      creator: { select: { id: true, name: true, email: true, avatarColor: true } },
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } },
      },
      places: {
        orderBy: [{ day: "asc" }, { order: "asc" }],
        include: {
          place: true,
          addedBy: { select: { id: true, name: true, avatarColor: true } },
        },
      },
      extraActivities: { orderBy: { createdAt: "asc" } },
    },
  });
}

export interface CompleteTripInput {
  didYouDoIt: boolean;
  visitedTripPlaceIds?: string[];
  extraActivities?: string[];
}

export async function completeTrip(tripId: string, input: CompleteTripInput) {
  if (!input.didYouDoIt) {
    await prisma.trip.update({
      where: { id: tripId },
      data: { askedCompletion: true, status: "not-completed", completedAt: null },
    });
    return getFullTrip(tripId);
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { places: true } });
  if (!trip) return null;

  const visitedSet = new Set(input.visitedTripPlaceIds ?? []);
  const extraTitles = (input.extraActivities ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 20);

  await prisma.$transaction([
    ...trip.places.map((tp) =>
      prisma.tripPlace.update({ where: { id: tp.id }, data: { visited: visitedSet.has(tp.id) } })
    ),
    prisma.trip.update({
      where: { id: tripId },
      data: { askedCompletion: true, status: "completed", completedAt: new Date() },
    }),
    ...extraTitles.map((title) => prisma.extraActivity.create({ data: { tripId, title } })),
  ]);

  return getFullTrip(tripId);
}

export async function addPlaceToTrip(tripId: string, placeId: string, userId: string, day = 1) {
  const existing = await prisma.tripPlace.findUnique({
    where: { tripId_placeId: { tripId, placeId } },
  });
  if (existing) return existing;

  const countForDay = await prisma.tripPlace.count({ where: { tripId, day } });
  return prisma.tripPlace.create({
    data: { tripId, placeId, day, order: countForDay, addedById: userId },
    include: { place: true, addedBy: { select: { id: true, name: true, avatarColor: true } } },
  });
}

export async function removePlaceFromTrip(tripId: string, tripPlaceId: string) {
  return prisma.tripPlace.deleteMany({ where: { id: tripPlaceId, tripId } });
}

export interface ReorderItem {
  tripPlaceId: string;
  day: number;
  order: number;
}

export async function reorderTripPlaces(tripId: string, items: ReorderItem[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.tripPlace.update({
        where: { id: item.tripPlaceId },
        data: { day: item.day, order: item.order },
      })
    )
  );
  return getFullTrip(tripId);
}

const PER_PERSON_DAILY_SPEND: Record<string, number> = {
  luxury: 7500,
  chill: 3200,
  romantic: 4200,
  family: 2600,
  "cost-saving": 1900,
  backpacking: 1100,
};

export function estimateDailySpend(travelStyle: string, travelerCount: number): number {
  const base = PER_PERSON_DAILY_SPEND[travelStyle] ?? 1900;
  return base * Math.max(travelerCount, 1);
}
