import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth";
import tripRoutes from "./routes/trips";
import placeRoutes from "./routes/places";
import hotelRoutes from "./routes/hotels";
import liveHotelRoutes from "./routes/liveHotels";
import wrappedRoutes from "./routes/wrapped";
import { registerTripCollab } from "./sockets/tripCollab";
import { setIo } from "./sockets/bus";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/live-hotels", liveHotelRoutes);
app.use("/api/wrapped", wrappedRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN },
});
setIo(io);
registerTripCollab(io);

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
