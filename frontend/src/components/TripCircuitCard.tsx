import { useCallback, useMemo } from "react";
import { Trip } from "../types";
import { normalizePoints } from "../utils/circuit";
import { destinationLabel } from "../constants/destinations";

interface Props {
  trip: Trip;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

function tripDayCount(trip: Trip): number {
  const ms = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

export default function TripCircuitCard({ trip }: Props) {
  const visitedItems = useMemo(
    () =>
      trip.itinerary
        .filter((i) => i.visited)
        .sort((a, b) => (a.day - b.day) || (a.order - b.order)),
    [trip.itinerary]
  );
  const extras = trip.extraActivities;

  const previewPoints = useMemo(
    () => normalizePoints(visitedItems.map((i) => i.place), 400, 180, 28),
    [visitedItems]
  );

  const download = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#dc2626");
    gradient.addColorStop(1, "#7f1d1d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 90 + Math.random() * 150, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 36px Inter, sans-serif";
    ctx.fillText("TripCanvas Circuit", 64, 100);
    ctx.font = "800 64px Inter, sans-serif";
    ctx.fillText(trip.title, 64, 180, CANVAS_WIDTH - 128);
    ctx.font = "500 30px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const dateLabel = `${new Date(trip.startDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} – ${new Date(trip.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    ctx.fillText(`${destinationLabel(trip.destination)} · ${dateLabel}`, 64, 224);

    // Route panel
    const panelX = 64;
    const panelY = 270;
    const panelW = CANVAS_WIDTH - 128;
    const panelH = 480;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    const radius = 28;
    ctx.beginPath();
    ctx.moveTo(panelX + radius, panelY);
    ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + panelH, radius);
    ctx.arcTo(panelX + panelW, panelY + panelH, panelX, panelY + panelH, radius);
    ctx.arcTo(panelX, panelY + panelH, panelX, panelY, radius);
    ctx.arcTo(panelX, panelY, panelX + panelW, panelY, radius);
    ctx.closePath();
    ctx.fill();

    if (visitedItems.length > 0) {
      const routePad = 70;
      const points = normalizePoints(
        visitedItems.map((i) => i.place),
        panelW,
        panelH,
        routePad
      ).map((p) => ({ x: panelX + p.x, y: panelY + p.y }));

      if (points.length > 1) {
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      points.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.fillStyle = "#dc2626";
        ctx.font = "700 22px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(idx + 1), p.x, p.y + 1);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      });
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "600 30px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("A trip made of moments, not just stops.", panelX + panelW / 2, panelY + panelH / 2);
      ctx.textAlign = "left";
    }

    // Stats line
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 40px Inter, sans-serif";
    const statsLine = `${visitedItems.length} stop${visitedItems.length === 1 ? "" : "s"} · ${extras.length} extra ${
      extras.length === 1 ? "memory" : "memories"
    } · ${tripDayCount(trip)} days`;
    ctx.fillText(statsLine, 64, panelY + panelH + 64);

    // Stop list
    let listY = panelY + panelH + 120;
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Where we went:", 64, listY);
    listY += 44;
    ctx.font = "500 28px Inter, sans-serif";
    ctx.fillStyle = "#ffffff";
    const stopNames = visitedItems.slice(0, 6);
    stopNames.forEach((item, idx) => {
      ctx.fillText(`${idx + 1}. ${item.place.name}`, 64, listY);
      listY += 40;
    });
    if (visitedItems.length > stopNames.length) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`+ ${visitedItems.length - stopNames.length} more`, 64, listY);
      listY += 40;
    }

    if (extras.length > 0) {
      listY += 16;
      ctx.font = "600 28px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("Also did:", 64, listY);
      listY += 44;
      ctx.font = "500 28px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      extras.slice(0, 4).forEach((activity) => {
        ctx.fillText(`✦ ${activity.title}`, 64, listY);
        listY += 40;
      });
      if (extras.length > 4) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(`+ ${extras.length - 4} more`, 64, listY);
      }
    }

    ctx.font = "600 26px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Plan together. Flex together. — TripCanvas", 64, CANVAS_HEIGHT - 60);

    const link = document.createElement("a");
    link.download = `triptogether-circuit-${trip.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [trip, visitedItems, extras]);

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-white/80">TripCanvas Circuit</p>
      <h3 className="text-xl font-extrabold">{trip.title}</h3>
      <p className="text-sm text-white/80">{destinationLabel(trip.destination)}</p>

      <div className="relative mt-4 h-44 w-full overflow-hidden rounded-xl bg-white/10">
        {visitedItems.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/80">
            A trip made of moments, not just stops.
          </div>
        ) : (
          <svg viewBox="0 0 400 180" className="h-full w-full">
            {previewPoints.length > 1 && (
              <polyline
                points={previewPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {previewPoints.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r={11} fill="white" />
                <text x={p.x} y={p.y + 4} fontSize={11} fontWeight={700} fill="#dc2626" textAnchor="middle">
                  {idx + 1}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-white">
        {visitedItems.length} stop{visitedItems.length === 1 ? "" : "s"} · {extras.length} extra{" "}
        {extras.length === 1 ? "memory" : "memories"} · {tripDayCount(trip)} days
      </p>

      <button
        onClick={download}
        className="mt-4 w-full rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm hover:bg-white/90"
      >
        ⬇ Download to share
      </button>
    </div>
  );
}
