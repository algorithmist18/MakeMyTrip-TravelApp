import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const destination = String(req.query.destination ?? "").toLowerCase().trim();
  if (!destination) {
    return res.status(400).json({ error: "destination query param is required" });
  }
  const places = await prisma.place.findMany({
    where: { destination },
    orderBy: [{ isHiddenGem: "asc" }, { rating: "desc" }],
  });
  res.json({ places });
});

router.get("/destinations", requireAuth, async (_req, res) => {
  const rows = await prisma.place.findMany({
    distinct: ["destination"],
    select: { destination: true, lat: true, lng: true },
  });
  res.json({ destinations: rows });
});

export default router;
