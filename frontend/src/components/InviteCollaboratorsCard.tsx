import { FormEvent, useState } from "react";
import { User } from "../types";

interface Props {
  collaborators: User[];
  onInvite: (email: string) => Promise<void>;
}

export default function InviteCollaboratorsCard({ collaborators, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onInvite(email.trim());
      setEmail("");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Couldn't invite that person");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ink-500">
        👥 Bring your people
      </p>
      <p className="mt-1 text-sm font-bold text-ink-900">Plan together</p>
      <p className="text-xs text-ink-500">Invite friends and keep every stop in sync.</p>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {collaborators.slice(0, 5).map((c) => (
            <span
              key={c.id}
              title={c.name}
              className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-xs font-bold text-white"
              style={{ backgroundColor: c.avatarColor }}
            >
              {c.name.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>
        <span className="text-sm font-semibold text-ink-700">{collaborators.length}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          className="min-w-0 flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-ink-900 px-3 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60"
        >
          Invite
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}
