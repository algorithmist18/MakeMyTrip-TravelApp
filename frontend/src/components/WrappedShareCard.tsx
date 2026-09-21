import { useCallback } from "react";
import { WrappedResponse } from "../types";
import { User } from "../types";

interface Props {
  data: WrappedResponse;
  user: User;
}

const WIDTH = 1080;
const HEIGHT = 1350;

export default function WrappedShareCard({ data, user }: Props) {
  const download = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#dc2626");
    gradient.addColorStop(1, "#7f1d1d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * WIDTH, Math.random() * HEIGHT, 80 + Math.random() * 160, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 40px Inter, sans-serif";
    ctx.fillText("TripTogether Wrapped", 64, 120);
    ctx.font = "800 120px Inter, sans-serif";
    ctx.fillText(String(data.year), 64, 250);

    ctx.font = "600 34px Inter, sans-serif";
    ctx.fillText(`${user.name}'s year of travel`, 64, 320);

    const stats: [string, string][] = [
      [String(data.stats.tripsCompleted), "trips completed"],
      [String(data.stats.citiesVisited), "cities visited"],
      [String(data.stats.totalDays), "days on the road"],
    ];
    let y = 470;
    for (const [value, label] of stats) {
      ctx.font = "800 96px Inter, sans-serif";
      ctx.fillText(value, 64, y);
      ctx.font = "500 32px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(label, 64, y + 42);
      ctx.fillStyle = "#ffffff";
      y += 160;
    }

    ctx.font = "700 32px Inter, sans-serif";
    ctx.fillText("The circuit:", 64, y + 20);
    ctx.font = "500 30px Inter, sans-serif";
    let listY = y + 70;
    data.trips.slice(0, 8).forEach((t, idx) => {
      ctx.fillText(`${idx + 1}. ${t.title}`, 64, listY);
      listY += 44;
    });

    ctx.font = "600 26px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Plan together. Flex together. — TripTogether", 64, HEIGHT - 60);

    const link = document.createElement("a");
    link.download = `triptogether-wrapped-${data.year}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [data, user]);

  return (
    <button
      onClick={download}
      className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ink-700"
    >
      ⬇ Download my Wrapped card
    </button>
  );
}
