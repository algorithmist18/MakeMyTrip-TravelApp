import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../db";
import { signToken } from "../utils/jwt";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const AVATAR_COLORS = ["#EF4444", "#F97316", "#0EA5E9", "#10B981", "#8B5CF6", "#EC4899"];
const GUEST_ADJECTIVES = ["Wandering", "Jetset", "Curious", "Sunny", "Intrepid", "Nomadic"];
const GUEST_NOUNS = ["Explorer", "Traveler", "Voyager", "Nomad", "Backpacker"];

function randomPick(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// Lets someone start planning without a signup form: a real User row is created
// behind the scenes so trips/collaborators/sockets keep working unchanged, but
// the person never sees a password field. The account can be revisited later
// with the token/email this endpoint returns.
router.post("/guest", async (_req, res) => {
  const name = `${randomPick(GUEST_ADJECTIVES)} ${randomPick(GUEST_NOUNS)} ${Math.floor(1000 + Math.random() * 9000)}`;
  const email = `guest-${crypto.randomBytes(6).toString("hex")}@guests.tripcanvas.local`;
  const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
  const avatarColor = randomPick(AVATAR_COLORS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, avatarColor },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor },
  });
});

const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const user = await prisma.user.create({
    data: { name, email, passwordHash, avatarColor },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor },
  });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor });
});

export default router;
