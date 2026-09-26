import { prisma } from "../db";

/**
 * Rule-based simulation of what an AI trip agent could do when a disruption
 * hits — NOT a live autonomous agent wired to real booking systems. It
 * reasons over the trip's own itinerary/hotel data (already in our DB) to
 * produce a plausible, concrete action plan. Framed in the UI as a demo of
 * the capability, not a production integration.
 */

export type ScenarioType = "flight_delay" | "hotel_overbooked" | "car_unavailable";

export interface ActionDraft {
  icon: string;
  title: string;
  detail: string;
  outcome: "auto-resolved" | "needs-confirmation" | "at-risk";
}

export interface SimulateInput {
  scenarioType: ScenarioType;
  delayHours?: number;
}

export interface SimulatedPlan {
  label: string;
  summary: string;
  actions: ActionDraft[];
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

export async function simulateDisruption(
  trip: { id: string; destination: string; travelStyle: string; title: string },
  input: SimulateInput
): Promise<SimulatedPlan> {
  if (input.scenarioType === "flight_delay") {
    const hours = Math.max(1, Math.min(24, input.delayHours ?? 3));
    const actions: ActionDraft[] = [
      {
        icon: "🛫",
        title: "Delay confirmed with airline",
        detail: `Your inbound flight to ${trip.title} is now running ${hours}h late. Logged automatically from the delay alert.`,
        outcome: "auto-resolved",
      },
      {
        icon: "🏨",
        title: "Hotel notified of late check-in",
        detail:
          hours <= 6
            ? "Property confirmed your room is held with no late-arrival fee — no action needed."
            : "Property flagged your check-in as past their standard hold window — a same-tier backup is lined up below just in case.",
        outcome: hours <= 6 ? "auto-resolved" : "needs-confirmation",
      },
    ];

    if (hours > 6) {
      const alt = await findAlternativeHotel(trip.destination, trip.travelStyle);
      actions.push({
        icon: "🔁",
        title: "Backup stay found",
        detail: alt
          ? `${alt.name} (${alt.tier} tier, ★${alt.rating.toFixed(1)}) has availability tonight and matches your travel style — confirm to switch if your original booking falls through.`
          : "No same-tier backup found nearby — you may need to call the property directly.",
        outcome: "needs-confirmation",
      });
    }

    if (hours > 3) {
      actions.push({
        icon: "🚗",
        title: "Airport transfer rescheduled",
        detail: `Pushed your pickup by ${hours}h to match the new arrival time. Driver notified automatically.`,
        outcome: "auto-resolved",
      });
      actions.push({
        icon: "🚙",
        title: "Rental car pickup at risk",
        detail: `If you have a rental booked for arrival day, the counter may close before your new landing time — agent is holding a request to extend the pickup window.`,
        outcome: "at-risk",
      });
    }

    actions.push({
      icon: "📅",
      title: "Day 1 plan compressed",
      detail:
        hours > 6
          ? "Your first day's activities likely won't fit — agent suggests pushing them to Day 2 and starting Day 1 with just check-in and rest."
          : "First day's plan still fits, just start a little later than planned.",
      outcome: hours > 6 ? "needs-confirmation" : "auto-resolved",
    });

    return {
      label: `Flight delayed ${hours}h`,
      summary: `Your trip agent reviewed the ${hours}h delay and adjusted ${actions.length} things — ${
        actions.filter((a) => a.outcome === "auto-resolved").length
      } handled automatically, ${actions.filter((a) => a.outcome !== "auto-resolved").length} need your OK.`,
      actions,
    };
  }

  if (input.scenarioType === "hotel_overbooked") {
    const alt = await findAlternativeHotel(trip.destination, trip.travelStyle);
    const actions: ActionDraft[] = [
      {
        icon: "⚠️",
        title: "Overbooking detected",
        detail: "Your hotel reported an overbooking for your dates and can no longer honor the reservation.",
        outcome: "at-risk",
      },
      {
        icon: "🔁",
        title: "Same-tier alternative secured",
        detail: alt
          ? `${alt.name} (${alt.tier} tier, ★${alt.rating.toFixed(1)}, ₹${alt.pricePerNight.toLocaleString(
              "en-IN"
            )}/night) matches your original booking's tier and travel style — held pending your confirmation.`
          : "No same-tier match found nearby — escalating to a human agent.",
        outcome: "needs-confirmation",
      },
      {
        icon: "💳",
        title: "Price difference covered",
        detail: "If the replacement costs more per night, the agent applies a goodwill credit to cover the gap.",
        outcome: "auto-resolved",
      },
      {
        icon: "🚗",
        title: "Transfers re-pointed",
        detail: "Any pre-booked airport/hotel transfers are automatically updated to the new address.",
        outcome: "auto-resolved",
      },
    ];
    return {
      label: "Hotel overbooked",
      summary: "Your trip agent found and held a same-tier replacement, and re-pointed your transfers automatically.",
      actions,
    };
  }

  // car_unavailable
  const actions: ActionDraft[] = [
    {
      icon: "🚙",
      title: "Rental unavailable at pickup",
      detail: "The rental counter reports your reserved car class is out of stock at pickup time.",
      outcome: "at-risk",
    },
    {
      icon: "🔁",
      title: "Comparable vehicle offered",
      detail: "Agent requested a same-class upgrade at no extra cost from the same counter — awaiting confirmation.",
      outcome: "needs-confirmation",
    },
    {
      icon: "🚕",
      title: "Rideshare fallback queued",
      detail: "If no vehicle is available within the hour, the agent will auto-book rideshare for your day's itinerary instead.",
      outcome: "needs-confirmation",
    },
    {
      icon: "📍",
      title: "Itinerary distances rechecked",
      detail: "Confirmed today's planned stops are all reachable by rideshare/taxi if the swap falls through.",
      outcome: "auto-resolved",
    },
  ];
  return {
    label: "Rental car unavailable",
    summary: "Your trip agent lined up a same-class swap and a rideshare fallback so today's plan still holds.",
    actions,
  };
}
