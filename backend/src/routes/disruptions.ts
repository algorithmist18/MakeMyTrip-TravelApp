import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { isTripMember } from "../services/tripService";
import { buildScenario, ScenarioType } from "../services/disruptionService";

const router = Router({ mergeParams: true });

function serializeDisruption(d: any) {
  return {
    id: d.id,
    scenarioType: d.scenarioType,
    label: d.label,
    summary: d.summary,
    planName: d.planName,
    totalCostDelta: d.totalCostDelta,
    costNote: d.costNote,
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
        costDelta: a.costDelta,
        costNote: a.costNote,
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

const scenarioSchema = z.object({
  scenarioType: z.enum(["flight_delay", "hotel_overbooked", "car_unavailable", "activity_closed"]),
  delayHours: z.number().int().min(1).max(24).optional(),
});

// Preview only — computes candidate plans + costs, writes nothing to the DB.
router.post("/simulate", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.tripId, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const parsed = scenarioSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const scenario = await buildScenario(trip, {
    scenarioType: parsed.data.scenarioType as ScenarioType,
    delayHours: parsed.data.delayHours,
  });

  res.json({ scenario });
});

const chooseSchema = scenarioSchema.extend({ optionId: z.string().min(1) });

// Recomputes the same scenario (deterministic given the same trip state) and
// persists whichever option the user picked.
router.post("/choose", requireAuth, async (req: AuthedRequest, res) => {
  const member = await isTripMember(req.params.tripId, req.userId!);
  if (!member) return res.status(404).json({ error: "Trip not found" });

  const parsed = chooseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const scenario = await buildScenario(trip, {
    scenarioType: parsed.data.scenarioType as ScenarioType,
    delayHours: parsed.data.delayHours,
  });
  const option = scenario.options.find((o) => o.id === parsed.data.optionId);
  if (!option) return res.status(400).json({ error: "That plan is no longer available — please simulate again" });

  const disruption = await prisma.disruption.create({
    data: {
      tripId: trip.id,
      scenarioType: parsed.data.scenarioType,
      label: scenario.label,
      summary: scenario.summary,
      planName: option.name,
      totalCostDelta: option.totalCostDelta,
      costNote: option.costNote,
      actions: {
        create: option.actions.map((a, idx) => ({
          icon: a.icon,
          title: a.title,
          detail: a.detail,
          outcome: a.outcome,
          status: a.outcome === "auto-resolved" ? "applied" : "proposed",
          costDelta: a.costDelta ?? 0,
          costNote: a.costNote ?? "",
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
