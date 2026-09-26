/**
 * Booking.com Demand API client — accommodations availability.
 *
 * This wraps POST {BOOKING_API_BASE_URL}/accommodations/availability.
 *
 * IMPORTANT — unverified against live docs: developers.booking.com is
 * gated behind a Managed Affiliate Partner contract, and this environment
 * could not fetch the live API reference to confirm exact field names.
 * The request/response shape below is reconstructed from public search
 * results describing the endpoint (accommodation ids, booker.country /
 * booker.platform, checkin/checkout, guests.number_of_adults /
 * number_of_rooms, an `extras` array). Treat this as a strong first draft:
 * verify field names and the base URL against your own Partner Centre
 * docs/Postman collection once you have access, and adjust as needed.
 *
 * Access requirements (not self-serve): a signed Booking.com Managed
 * Affiliate Partner contract, an Account Manager-issued affiliate ID and
 * API bearer token from the Partner Centre, and — per Booking's General
 * Partner Terms — prior written approval from Booking.com before AI
 * tooling can be used to build against this API.
 */

const BASE_URL = process.env.BOOKING_API_BASE_URL;
const API_KEY = process.env.BOOKING_API_KEY;
const AFFILIATE_ID = process.env.BOOKING_AFFILIATE_ID;

export function isBookingConfigured(): boolean {
  return Boolean(BASE_URL && API_KEY && AFFILIATE_ID);
}

export interface AvailabilityParams {
  accommodationIds: string[];
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  adults?: number;
  rooms?: number;
  /** Two-letter lowercase country code for the booker, e.g. "in". */
  bookerCountry?: string;
}

export interface AccommodationAvailability {
  accommodationId: string;
  currency: string;
  price: number;
  raw: unknown;
}

export class BookingNotConfiguredError extends Error {
  constructor() {
    super("Booking.com Demand API is not configured (missing base URL, API key, or affiliate ID)");
    this.name = "BookingNotConfiguredError";
  }
}

export async function checkAvailability(params: AvailabilityParams): Promise<AccommodationAvailability[]> {
  if (!isBookingConfigured()) {
    throw new BookingNotConfiguredError();
  }

  const body = {
    accommodation: { ids: params.accommodationIds },
    booker: {
      country: params.bookerCountry ?? "in",
      platform: "desktop",
    },
    checkin: params.checkin,
    checkout: params.checkout,
    guests: {
      number_of_adults: params.adults ?? 2,
      number_of_rooms: params.rooms ?? 1,
    },
    extras: ["extra_charges"],
  };

  const res = await fetch(`${BASE_URL}/accommodations/availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "Affiliate-Id": AFFILIATE_ID as string,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Booking.com API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as any;
  const results = Array.isArray(data) ? data : data?.data ?? [];

  return results.map((entry: any) => ({
    accommodationId: String(entry.accommodation_id ?? entry.accommodation?.id ?? ""),
    currency: entry.product?.[0]?.price?.currency ?? entry.currency ?? "USD",
    price: Number(entry.product?.[0]?.price?.value ?? entry.price ?? 0),
    raw: entry,
  }));
}
