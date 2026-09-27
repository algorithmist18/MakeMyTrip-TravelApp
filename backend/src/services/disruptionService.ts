import { prisma } from "../db";

/**
 * Rule-based simulation of what an AI trip agent could do when a disruption
 * hits — NOT a live autonomous agent wired to real booking systems. It
 * reasons over the trip's own itinerary/hotel data (already in our DB) to
 * produce a handful of concrete, differently-priced plans. Framed in the UI
 * as a demo of the capability, not a production integration.
 */

export type ScenarioType = "flight_delay" | "hotel_overbooked" | "car_unavailable" | "activity_closed";

export interface ActionDraft {
  icon: string;
  title: string;
  detail: string;
  outcome: "auto-resolved" | "needs-confirmation" | "at-risk";
  /** INR. Positive = extra spend, negative = refund/credit, 0/omitted = no cost impact. */
  costDelta?: number;
  costNote?: string;
}

export interface PlanOption {
  id: string;
  name: string;
  recommended: boolean;
  totalCostDelta: number;
  costNote: string;
  actions: ActionDraft[];
}

export interface SimulatedScenario {
  label: string;
  summary: string;
  options: PlanOption[];
}

export interface SimulateInput {
  scenarioType: ScenarioType;
  delayHours?: number;
}

const STYLE_NIGHTLY_ESTIMATE: Record<string, number> = {
  "cost-saving": 2200,
  backpacking: 1800,
  chill: 4200,
  family: 4600,
  luxury: 9500,
  romantic: 8200,
};

function sumCost(actions: ActionDraft[]) {
  return actions.reduce((total, a) => total + (a.costDelta ?? 0), 0);
}

function formatCost(amount: number) {
  if (amount === 0) return "No extra cost";
  const sign = amount > 0 ? "+" : "-";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

async function findAlternativeHotel(destination: string, travelStyle: string, excludeName?: string) {
  const hotels = await prisma.hotel.findMany({ where: { destination } });
  const tierOrderByStyle: Record<string, string[]> = {
    luxury: ["luxury", "mid", "budget"],
    chill: ["mid", "luxury", "budget"],
    romantic: ["luxury", "mid", "budget"],
    family: ["mid", "budget", "luxury"],
    "cost-saving": ["budget", "mid", "luxury"],
    backpacking: ["budget", "mid", "luxury"],
  };
  const tierOrder = tierOrderByStyle[travelStyle] ?? ["mid", "budget", "luxury"];
  return hotels
    .filter((h) => h.name !== excludeName)
    .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier) || b.rating - a.rating)[0];
}

async function findUpgradeHotel(destination: string, excludeName?: string) {
  const hotels = await prisma.hotel.findMany({ where: { destination } });
  return hotels
    .filter((h) => h.name !== excludeName)
    .sort((a, b) => {
      const rank = (h: (typeof hotels)[number]) => (h.tier === "luxury" ? 0 : h.tier === "mid" ? 1 : 2);
      return rank(a) - rank(b) || b.rating - a.rating;
    })[0];
}

interface TripContext {
  id: string;
  destination: string;
  travelStyle: string;
  title: string;
  startDate: Date;
  endDate: Date;
}

async function currentNightlyRate(trip: TripContext) {
  const tripHotel = await prisma.tripHotel.findFirst({ where: { tripId: trip.id }, include: { hotel: true } });
  if (tripHotel) return { rate: tripHotel.hotel.pricePerNight, name: tripHotel.hotel.name };
  return { rate: STYLE_NIGHTLY_ESTIMATE[trip.travelStyle] ?? 4000, name: undefined as string | undefined };
}

function remainingNights(trip: TripContext) {
  const ms = trip.endDate.getTime() - trip.startDate.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function sortOptions(options: PlanOption[]) {
  return [...options].sort((a, b) => Number(b.recommended) - Number(a.recommended));
}

async function buildFlightDelayScenario(trip: TripContext, delayHours?: number): Promise<SimulatedScenario> {
  const hours = Math.max(1, Math.min(24, delayHours ?? 3));
  const { rate: nightlyRate, name: currentHotelName } = await currentNightlyRate(trip);
  const alt = await findAlternativeHotel(trip.destination, trip.travelStyle, currentHotelName);

  const delayConfirmed: ActionDraft = {
    icon: "🛫",
    title: "Delay confirmed with airline",
    detail: `Your inbound flight to ${trip.title} is now running ${hours}h late. Logged automatically from the delay alert.`,
    outcome: "auto-resolved",
  };

  const keepActions: ActionDraft[] = [
    delayConfirmed,
    {
      icon: "🏨",
      title: "Hotel notified of late check-in",
      detail:
        hours <= 6
          ? "Property confirmed your room is held with no late-arrival fee — no action needed."
          : "Property flagged your check-in as past their standard hold window.",
      outcome: hours <= 6 ? "auto-resolved" : "needs-confirmation",
    },
  ];
  if (hours > 6) {
    keepActions.push({
      icon: "⚠️",
      title: "Room may be released without a call-ahead",
      detail: "If the property re-lets the room after their hold window, you'd forfeit tonight's prepaid rate.",
      outcome: "at-risk",
      costDelta: nightlyRate,
      costNote: "Worst case only — not charged unless the room is actually released.",
    });
  }

  const switchActions: ActionDraft[] = [
    delayConfirmed,
    {
      icon: "🔁",
      title: "Backup stay found & held",
      detail: alt
        ? `${alt.name} (${alt.tier} tier, ★${alt.rating.toFixed(1)}) has availability tonight and matches your travel style.`
        : "No same-tier backup found nearby — you may need to call the property directly.",
      outcome: "auto-resolved",
      costDelta: alt ? alt.pricePerNight - nightlyRate : 0,
      costNote: alt ? `${alt.name}: ₹${alt.pricePerNight.toLocaleString("en-IN")}/night vs your ₹${nightlyRate.toLocaleString("en-IN")}/night.` : undefined,
    },
    {
      icon: "🚗",
      title: "Airport transfer rescheduled",
      detail: `Pushed your pickup by ${hours}h to match the new arrival time. Driver notified automatically.`,
      outcome: "auto-resolved",
    },
  ];
  if (hours > 6) {
    switchActions.push({
      icon: "📅",
      title: "Day 1 plan compressed",
      detail: "Your first day's activities likely won't fit — pushed to Day 2, Day 1 starts with just check-in and rest.",
      outcome: "needs-confirmation",
    });
  }
  if (hours > 3) {
    switchActions.push({
      icon: "🚙",
      title: "Rental car pickup window extended",
      detail: "Requested an extension on your rental pickup window so it still lines up with the new landing time.",
      outcome: "needs-confirmation",
    });
  }

  const guaranteeActions: ActionDraft[] = [
    delayConfirmed,
    {
      icon: "🛡️",
      title: "Late-arrival guarantee purchased",
      detail: "A flat guarantee fee locks your original room regardless of how late you land — no risk of losing it.",
      outcome: "auto-resolved",
      costDelta: 1200,
      costNote: "One-time flat fee, refunded if you arrive before the property's normal cutoff.",
    },
    {
      icon: "🚗",
      title: "Airport transfer rescheduled",
      detail: `Pushed your pickup by ${hours}h. Driver notified automatically.`,
      outcome: "auto-resolved",
    },
  ];

  const keep: PlanOption = {
    id: "keep",
    name: "Keep your booking & wait it out",
    recommended: hours <= 6,
    totalCostDelta: sumCost(keepActions),
    costNote: hours > 6 ? "Free, but carries a chance of losing tonight's room." : "No cost, no risk — you're inside the hotel's hold window.",
    actions: keepActions,
  };
  const switchPlan: PlanOption = {
    id: "switch",
    name: "Switch to a backup hotel tonight",
    recommended: hours > 6,
    totalCostDelta: sumCost(switchActions),
    costNote: "Guarantees a room; final cost depends on the backup property's rate.",
    actions: switchActions,
  };
  const guarantee: PlanOption = {
    id: "guarantee",
    name: "Pay to guarantee your original room",
    recommended: false,
    totalCostDelta: sumCost(guaranteeActions),
    costNote: "Small flat fee, zero risk, no need to move hotels.",
    actions: guaranteeActions,
  };

  return {
    label: `Flight delayed ${hours}h`,
    summary: `Your trip agent reviewed the ${hours}h delay and drew up ${3} ways to handle it — pick the one that fits your risk tolerance and budget.`,
    options: sortOptions([keep, switchPlan, guarantee]),
  };
}

async function buildHotelOverbookedScenario(trip: TripContext): Promise<SimulatedScenario> {
  const { rate: nightlyRate, name: currentHotelName } = await currentNightlyRate(trip);
  const nights = remainingNights(trip);
  const sameTier = await findAlternativeHotel(trip.destination, trip.travelStyle, currentHotelName);
  const upgrade = await findUpgradeHotel(trip.destination, currentHotelName);

  const overbookingDetected: ActionDraft = {
    icon: "⚠️",
    title: "Overbooking detected",
    detail: "Your hotel reported an overbooking for your dates and can no longer honor the reservation.",
    outcome: "at-risk",
  };

  const agentPickGap = sameTier ? Math.max(0, sameTier.pricePerNight - nightlyRate) * nights : 0;
  const agentPickActions: ActionDraft[] = [
    overbookingDetected,
    {
      icon: "🔁",
      title: "Same-tier alternative secured",
      detail: sameTier
        ? `${sameTier.name} (${sameTier.tier} tier, ★${sameTier.rating.toFixed(1)}) matches your original booking — held pending confirmation.`
        : "No same-tier match found nearby — escalating to a human agent.",
      outcome: "needs-confirmation",
    },
    {
      icon: "💳",
      title: "Price difference covered by goodwill credit",
      detail: sameTier ? `Agent applies a credit to cover the ₹${agentPickGap.toLocaleString("en-IN")} gap over ${nights} night(s).` : "No gap to cover.",
      outcome: "auto-resolved",
      costDelta: -agentPickGap,
    },
    { icon: "🚗", title: "Transfers re-pointed", detail: "Pre-booked airport/hotel transfers automatically updated to the new address.", outcome: "auto-resolved" },
  ];

  const upgradeGap = upgrade ? Math.max(0, upgrade.pricePerNight - nightlyRate) * nights : 0;
  const upgradeActions: ActionDraft[] = [
    overbookingDetected,
    {
      icon: "⬆️",
      title: "Tier upgrade offered",
      detail: upgrade
        ? `${upgrade.name} (${upgrade.tier} tier, ★${upgrade.rating.toFixed(1)}) has availability for your full stay.`
        : "No upgrade tier available nearby.",
      outcome: "needs-confirmation",
      costDelta: upgradeGap,
      costNote: upgrade ? `₹${upgrade.pricePerNight.toLocaleString("en-IN")}/night × ${nights} night(s), you cover the difference.` : undefined,
    },
    { icon: "🚗", title: "Transfers re-pointed", detail: "Pre-booked transfers automatically updated to the new address.", outcome: "auto-resolved" },
  ];

  const refundAmount = nightlyRate * nights;
  const refundActions: ActionDraft[] = [
    overbookingDetected,
    {
      icon: "💸",
      title: "Full refund issued for remaining nights",
      detail: `₹${refundAmount.toLocaleString("en-IN")} refunded for ${nights} night(s) — processed to your original payment method.`,
      outcome: "auto-resolved",
      costDelta: -refundAmount,
    },
    {
      icon: "🔎",
      title: "You'll need to rebook a stay yourself",
      detail: "The agent won't auto-book a replacement for this option — you're free to find your own place with the refund.",
      outcome: "at-risk",
    },
  ];

  const agentPick: PlanOption = {
    id: "agent-pick",
    name: "Accept agent's same-tier pick",
    recommended: true,
    totalCostDelta: sumCost(agentPickActions),
    costNote: "Fully handled for you — any price gap is covered by credit.",
    actions: agentPickActions,
  };
  const upgradePlan: PlanOption = {
    id: "upgrade",
    name: "Upgrade a tier at your own cost",
    recommended: false,
    totalCostDelta: sumCost(upgradeActions),
    costNote: "Nicer stay, but you pay the difference for the full remaining trip.",
    actions: upgradeActions,
  };
  const refundPlan: PlanOption = {
    id: "refund",
    name: "Take a refund & self-book",
    recommended: false,
    totalCostDelta: sumCost(refundActions),
    costNote: "Full cash back, but you handle rebooking on your own.",
    actions: refundActions,
  };

  return {
    label: "Hotel overbooked",
    summary: "Your trip agent found three ways to handle the overbooking — from fully automated to fully refunded.",
    options: sortOptions([agentPick, upgradePlan, refundPlan]),
  };
}

async function buildCarUnavailableScenario(): Promise<SimulatedScenario> {
  const rentalDailyRate = 1800;
  const rideshareDailyEstimate = 900;
  const premiumUpgradeFee = 2200;

  const rentalUnavailable: ActionDraft = {
    icon: "🚙",
    title: "Rental unavailable at pickup",
    detail: "The rental counter reports your reserved car class is out of stock at pickup time.",
    outcome: "at-risk",
  };

  const swapActions: ActionDraft[] = [
    rentalUnavailable,
    { icon: "🔁", title: "Comparable vehicle offered", detail: "Agent requested a same-class upgrade at no extra cost from the same counter.", outcome: "needs-confirmation" },
    { icon: "📍", title: "Itinerary distances rechecked", detail: "Confirmed today's planned stops are all reachable with the swapped vehicle.", outcome: "auto-resolved" },
  ];

  const rideshareActions: ActionDraft[] = [
    rentalUnavailable,
    {
      icon: "🚕",
      title: "Rental cancelled, rideshare booked for today",
      detail: `Today's rental (₹${rentalDailyRate.toLocaleString("en-IN")}) refunded; rideshare across today's stops estimated at ₹${rideshareDailyEstimate.toLocaleString("en-IN")}.`,
      outcome: "auto-resolved",
      costDelta: rideshareDailyEstimate - rentalDailyRate,
      costNote: "Net difference for today only — you're not locked into rideshare for the rest of the trip.",
    },
    { icon: "📍", title: "Itinerary distances rechecked", detail: "Confirmed today's planned stops are all reachable by rideshare/taxi.", outcome: "auto-resolved" },
  ];

  const premiumActions: ActionDraft[] = [
    rentalUnavailable,
    {
      icon: "⬆️",
      title: "Premium class upgrade",
      detail: "Counter offered an immediate upgrade to their premium class, available right now.",
      outcome: "auto-resolved",
      costDelta: premiumUpgradeFee,
      costNote: "One-time upgrade fee for the remainder of your rental period.",
    },
    { icon: "📍", title: "Itinerary distances rechecked", detail: "Confirmed today's planned stops are all reachable with the upgraded vehicle.", outcome: "auto-resolved" },
  ];

  const swap: PlanOption = {
    id: "swap",
    name: "Accept comparable vehicle (free)",
    recommended: true,
    totalCostDelta: sumCost(swapActions),
    costNote: "No cost, same class, first thing the agent tries.",
    actions: swapActions,
  };
  const rideshare: PlanOption = {
    id: "rideshare",
    name: "Switch to rideshare for today",
    recommended: false,
    totalCostDelta: sumCost(rideshareActions),
    costNote: "Skip the rental entirely for today; resume tomorrow if it's back in stock.",
    actions: rideshareActions,
  };
  const premium: PlanOption = {
    id: "premium",
    name: "Upgrade to premium class",
    recommended: false,
    totalCostDelta: sumCost(premiumActions),
    costNote: "Guaranteed availability right now, nicer car, extra fee.",
    actions: premiumActions,
  };

  return {
    label: "Rental car unavailable",
    summary: "Your trip agent lined up three ways to keep today's plan moving — a free swap, a rideshare day, or a paid upgrade.",
    options: sortOptions([swap, rideshare, premium]),
  };
}

async function buildActivityClosedScenario(trip: TripContext): Promise<SimulatedScenario> {
  const bookedPlace = await prisma.tripPlace.findFirst({
    where: { tripId: trip.id },
    include: { place: true },
    orderBy: { order: "asc" },
  });
  const closedName = bookedPlace?.place.name ?? `a booked activity in ${trip.destination}`;

  const alternatives = await prisma.place.findMany({ where: { destination: trip.destination } });
  const swapCandidate = alternatives
    .filter((p) => p.id !== bookedPlace?.placeId)
    .sort((a, b) => b.rating - a.rating)[0];

  const ticketEstimate = 500;

  const closedDetected: ActionDraft = {
    icon: "🚧",
    title: "Closure detected",
    detail: `${closedName} reported an unplanned closure (maintenance/weather) for your visit date.`,
    outcome: "at-risk",
  };

  const swapActions: ActionDraft[] = [
    closedDetected,
    {
      icon: "🔁",
      title: "Similar nearby spot suggested",
      detail: swapCandidate
        ? `${swapCandidate.name} (★${swapCandidate.rating.toFixed(1)}, ${swapCandidate.durationLabel}) is open and close by — itinerary slot swapped automatically.`
        : "No close alternative found — you may want to leave this slot free.",
      outcome: "auto-resolved",
    },
    { icon: "📅", title: "Day plan re-sequenced", detail: "Remaining stops for the day reordered so travel times still make sense.", outcome: "auto-resolved" },
  ];

  const refundActions: ActionDraft[] = [
    closedDetected,
    {
      icon: "💸",
      title: "Pre-booked ticket refunded",
      detail: `If you had a ticket booked through us, the ~₹${ticketEstimate.toLocaleString("en-IN")} fee is refunded automatically.`,
      outcome: "auto-resolved",
      costDelta: -ticketEstimate,
      costNote: "Only applies if a ticket was pre-booked through the app; otherwise there's nothing to refund.",
    },
    { icon: "🗓️", title: "Slot left open", detail: "This time slot is freed up on your itinerary for you to fill spontaneously.", outcome: "needs-confirmation" },
  ];

  const rescheduleActions: ActionDraft[] = [
    closedDetected,
    {
      icon: "📆",
      title: "Moved to a free slot later in the trip",
      detail: "Agent found an open slot later in your itinerary with matching opening hours and moved this activity there.",
      outcome: "needs-confirmation",
    },
  ];

  const swap: PlanOption = {
    id: "swap",
    name: "Swap for a similar open spot",
    recommended: true,
    totalCostDelta: sumCost(swapActions),
    costNote: "No cost, keeps your day full.",
    actions: swapActions,
  };
  const refund: PlanOption = {
    id: "refund",
    name: "Skip it & take a refund",
    recommended: false,
    totalCostDelta: sumCost(refundActions),
    costNote: "Best if nothing nearby appeals to you.",
    actions: refundActions,
  };
  const reschedule: PlanOption = {
    id: "reschedule",
    name: "Reschedule to later in the trip",
    recommended: false,
    totalCostDelta: sumCost(rescheduleActions),
    costNote: "Best if you don't want to lose this activity entirely.",
    actions: rescheduleActions,
  };

  return {
    label: "Activity closed",
    summary: `${closedName} is unexpectedly closed — here's how the agent suggests handling the gap in your day.`,
    options: sortOptions([swap, refund, reschedule]),
  };
}

export async function buildScenario(trip: TripContext, input: SimulateInput): Promise<SimulatedScenario> {
  if (input.scenarioType === "flight_delay") return buildFlightDelayScenario(trip, input.delayHours);
  if (input.scenarioType === "hotel_overbooked") return buildHotelOverbookedScenario(trip);
  if (input.scenarioType === "activity_closed") return buildActivityClosedScenario(trip);
  return buildCarUnavailableScenario();
}

export { formatCost };
