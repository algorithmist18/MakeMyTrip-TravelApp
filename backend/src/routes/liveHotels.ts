import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { BookingNotConfiguredError, checkAvailability, isBookingConfigured } from "../services/bookingService";

const router = Router();

router.get("/status", requireAuth, (_req, res) => {
  res.json({ connected: isBookingConfigured() });
});

const availabilitySchema = z.object({
  accommodationIds: z.string().min(1), // comma-separated Booking.com accommodation ids
  checkin: z.string(),
  checkout: z.string(),
  adults: z.coerce.number().int().min(1).max(20).optional(),
  rooms: z.coerce.number().int().min(1).max(10).optional(),
});

router.get("/availability", requireAuth, async (req, res) => {
  if (!isBookingConfigured()) {
    return res.status(503).json({
      connected: false,
      error:
        "Booking.com isn't connected yet. This needs a Managed Affiliate Partner account — set " +
        "BOOKING_API_BASE_URL, BOOKING_API_KEY, and BOOKING_AFFILIATE_ID once you have Partner Centre credentials.",
    });
  }

  const parsed = availabilitySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query params" });
  }
  const { accommodationIds, checkin, checkout, adults, rooms } = parsed.data;

  try {
    const results = await checkAvailability({
      accommodationIds: accommodationIds.split(",").map((s) => s.trim()).filter(Boolean),
      checkin,
      checkout,
      adults,
      rooms,
    });
    res.json({ connected: true, results });
  } catch (err) {
    if (err instanceof BookingNotConfiguredError) {
      return res.status(503).json({ connected: false, error: err.message });
    }
    res.status(502).json({ connected: true, error: err instanceof Error ? err.message : "Booking.com API request failed" });
  }
});

export default router;
