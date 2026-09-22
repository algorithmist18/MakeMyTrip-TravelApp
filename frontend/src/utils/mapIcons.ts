import L from "leaflet";

export function numberedIcon(num: number, color = "#EF4444"): L.DivIcon {
  return L.divIcon({
    className: "trip-numbered-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;font-family:Inter,system-ui,sans-serif;box-shadow:0 1px 4px rgba(15,23,42,0.35);border:2px solid #fff;">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}
