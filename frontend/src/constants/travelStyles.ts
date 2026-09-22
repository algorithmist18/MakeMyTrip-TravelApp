import { HotelTier, TravelStyle } from "../types";

export interface TravelStyleMeta {
  key: TravelStyle;
  icon: string;
  title: string;
  subtitle: string;
  spendNote: string;
  paceHint: string;
  /** Soft target for how many places to pick for the trip. */
  targetPlaces: number;
  /** Hotel tiers in preferred order for this style. */
  hotelTierOrder: HotelTier[];
}

export const TRAVEL_STYLES: TravelStyleMeta[] = [
  {
    key: "luxury",
    icon: "💎",
    title: "Luxury",
    subtitle: "Top-rated stays, private transfers",
    spendNote: "Private cabs + 5-star stays for a seamless trip.",
    paceHint: "2–3 stops/day — curated, never rushed",
    targetPlaces: 4,
    hotelTierOrder: ["luxury", "mid", "budget"],
  },
  {
    key: "chill",
    icon: "🧘",
    title: "Chill",
    subtitle: "More time, fewer stops",
    spendNote: "Private cabs + curated stays keep it comfortable.",
    paceHint: "1–2 stops/day — leave room to wander",
    targetPlaces: 3,
    hotelTierOrder: ["mid", "luxury", "budget"],
  },
  {
    key: "romantic",
    icon: "💕",
    title: "Romantic",
    subtitle: "Scenic spots, curated for two",
    spendNote: "Sunset spots and quiet stays, made for two.",
    paceHint: "2 stops/day — unhurried, sunset-friendly",
    targetPlaces: 3,
    hotelTierOrder: ["luxury", "mid", "budget"],
  },
  {
    key: "family",
    icon: "👨‍👩‍👧",
    title: "Family",
    subtitle: "Kid-friendly pace, early nights",
    spendNote: "Stroller-friendly stops and early dinners built in.",
    paceHint: "1–2 stops/day — early starts, early nights",
    targetPlaces: 3,
    hotelTierOrder: ["mid", "budget", "luxury"],
  },
  {
    key: "cost-saving",
    icon: "🚈",
    title: "Cost-saving",
    subtitle: "Smart transit, local eats",
    spendNote: "BTS + buses keeps this plan on budget.",
    paceHint: "2–3 stops/day — balanced and efficient",
    targetPlaces: 4,
    hotelTierOrder: ["budget", "mid", "luxury"],
  },
  {
    key: "backpacking",
    icon: "🗺️",
    title: "Backpacking",
    subtitle: "Maximum adventure",
    spendNote: "Hostels + street food, max stretch per rupee.",
    paceHint: "3–4 stops/day — pack it in",
    targetPlaces: 6,
    hotelTierOrder: ["budget", "mid", "luxury"],
  },
];

export const TRAVEL_STYLE_MAP: Record<TravelStyle, TravelStyleMeta> = Object.fromEntries(
  TRAVEL_STYLES.map((s) => [s.key, s])
) as Record<TravelStyle, TravelStyleMeta>;

export function travelStyleLabel(style: string): string {
  return TRAVEL_STYLE_MAP[style as TravelStyle]?.title ?? style;
}
