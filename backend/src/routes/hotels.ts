import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const destination = String(req.query.destination ?? "").toLowerCase().trim();
  if (!destination) {
    return res.status(400).json({ error: "destination query param is required" });
  }
  const hotels = await prisma.hotel.findMany({
    where: { destination },
    orderBy: { rating: "desc" },
  });
  res.json({ hotels });
});

export default router;
