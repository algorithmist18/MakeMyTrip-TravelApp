export interface DestinationMeta {
  key: string;
  label: string;
  country: string;
  lat: number;
  lng: number;
}

export const DESTINATIONS: DestinationMeta[] = [
  { key: "bangkok", label: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { key: "phuket", label: "Phuket", country: "Thailand", lat: 7.8804, lng: 98.3923 },
  { key: "chiang-mai", label: "Chiang Mai", country: "Thailand", lat: 18.7883, lng: 98.9853 },
  { key: "pattaya", label: "Pattaya", country: "Thailand", lat: 12.9236, lng: 100.8825 },
  { key: "krabi", label: "Krabi", country: "Thailand", lat: 8.0863, lng: 98.9063 },
  { key: "goa", label: "Goa", country: "India", lat: 15.2993, lng: 74.124 },
  { key: "manali", label: "Manali", country: "India", lat: 32.2432, lng: 77.1892 },
];

export const DESTINATIONS_BY_COUNTRY = DESTINATIONS.reduce<Record<string, DestinationMeta[]>>((acc, d) => {
  (acc[d.country] ??= []).push(d);
  return acc;
}, {});

const DESTINATION_MAP: Record<string, DestinationMeta> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.key, d])
);

export function destinationLabel(key: string): string {
  const known = DESTINATION_MAP[key];
  if (known) return known.label;
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function destinationFullLabel(key: string): string {
  const known = DESTINATION_MAP[key];
  return known ? `${known.label}, ${known.country}` : destinationLabel(key);
}
