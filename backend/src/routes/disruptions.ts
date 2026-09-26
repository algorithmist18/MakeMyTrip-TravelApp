import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { isTripMember } from "../services/tripService";
import { simulateDisruption, ScenarioType } from "../services/disruptionService";

const router = Router({ mergeParams: true });

function serializeDisruption(d: any) {
  return {
    id: d.id,
    scenarioType: d.scenarioType,
    label: d.label,
    summary: d.summary,
    status: d.status,
    createdAt: d.createdAt,
    actions: d.actions
      .sort((a: any, b: any) => a.order - b.order)
      .map((a: any) => ({
        id: a.id,
        icon: a.icon,
        title: a.title,
        detail: a.detail,
        outcome: a.outcome,
        status: a.status,
      })),
  };
}

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.tripId, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const disruptions = await prisma.disruption.findMany({
    where: { tripId: req.params.tripId },
    include: { actions: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ disruptions: disruptions.map(serializeDisruption) });
});

const simulateSchema = z.object({
  scenarioType: z.enum(["flight_delay", "hotel_overbooked", "car_unavailable"]),
  delayHours: z.number().int().min(1).max(24).optional(),
});

router.post("/simulate", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.tripId, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const plan = await simulateDisruption(trip, {
    scenarioType: parsed.data.scenarioType as ScenarioType,
    delayHours: parsed.data.delayHours,
  });

  const disruption = await prisma.disruption.create({
    data: {
      tripId: trip.id,
      scenarioType: parsed.data.scenarioType,
      label: plan.label,
      summary: plan.summary,
      actions: {
        create: plan.actions.map((a, idx) => ({
          icon: a.icon,
          title: a.title,
          detail: a.detail,
          outcome: a.outcome,
          status: a.outcome === "auto-resolved" ? "applied" : "proposed",
          order: idx,
        })),
      },
    },
    include: { actions: true },
  });

  res.status(201).json({ disruption: serializeDisruption(disruption) });
});

router.post("/:disruptionId/apply", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.tripId, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  await prisma.disruptionAction.updateMany({
    where: { disruptionId: req.params.disruptionId },
    data: { status: "applied" },
  });
  const disruption = await prisma.disruption.update({
    where: { id: req.params.disruptionId },
    data: { status: "applied" },
    include: { actions: true },
  });
  res.json({ disruption: serializeDisruption(disruption) });
});

router.post("/:disruptionId/dismiss", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.tripId, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const disruption = await prisma.disruption.update({
    where: { id: req.params.disruptionId },
    data: { status: "dismissed" },
    include: { actions: true },
  });
  res.json({ disruption: serializeDisruption(disruption) });
});

export default router;
