interface Props {
  icon: string;
  label: string;
  value: string | number;
}

export default function StatTile({ icon, label, value }: Props) {
  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 text-center shadow-sm">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-3xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
    </div>
  );
}
