import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import { isTripMember } from "../services/tripService";
import { tripRoom } from "./bus";

interface AuthedSocket extends Socket {
  userId?: string;
  userName?: string;
}

export function registerTripCollab(io: Server) {
  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next();
    try {
      const payload = verifyToken(token);
      socket.userId = payload.userId;
    } catch {
      // invalid token: allow connection but leave userId undefined
    }
    next();
  });

  io.on("connection", (socket: AuthedSocket) => {
    socket.on("join_trip", async (tripId: string) => {
      if (!socket.userId || typeof tripId !== "string") return;
      const member = await isTripMember(tripId, socket.userId);
      if (!member) return;
      socket.join(tripRoom(tripId));
      socket.to(tripRoom(tripId)).emit("collaborator_presence", {
        userId: socket.userId,
        joinedAt: new Date().toISOString(),
      });
    });

    socket.on("leave_trip", (tripId: string) => {
      if (typeof tripId !== "string") return;
      socket.leave(tripRoom(tripId));
    });

    socket.on("cursor_move", (payload: { tripId: string; lat: number; lng: number }) => {
      if (!socket.userId || !payload?.tripId) return;
      socket.to(tripRoom(payload.tripId)).emit("collaborator_cursor", {
        userId: socket.userId,
        lat: payload.lat,
        lng: payload.lng,
      });
    });
  });
}
