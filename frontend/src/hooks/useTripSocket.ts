import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Trip } from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function useTripSocket(tripId: string | undefined, onTripUpdate: (trip: Trip) => void) {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onTripUpdate);
  callbackRef.current = onTripUpdate;

  useEffect(() => {
    if (!tripId) return;
    const token = localStorage.getItem("tt_token") || undefined;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_trip", tripId);
    });

    socket.on("trip_updated", (trip: Trip) => {
      callbackRef.current(trip);
    });

    return () => {
      socket.emit("leave_trip", tripId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tripId]);

  return socketRef;
}
