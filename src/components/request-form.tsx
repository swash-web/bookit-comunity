"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function RequestForm({ providerId, services }: { providerId: string; services: string[] }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, providerId }) });
    const data = await res.json(); setBusy(false);
    if (!res.ok) return setError(data.error || "Could not submit request.");
    router.push("/dashboard?sent=1");
  }
  return <form onSubmit={submit} className="mt-5 space-y-4">
    <div><label className="label">Service needed</label><select name="serviceTitle" required className="input">{services.length ? services.map(s=><option key={s}>{s}</option>) : <option>General service request</option>}</select></div>
    <div><label className="label">Describe the work</label><textarea name="description" required minLength={10} rows={3} className="input" placeholder="What needs to be done?"/></div>
    <div><label className="label">Service location</label><input name="location" required className="input" placeholder="e.g. Molyko, Buea"/></div>
    <div><label className="label">Preferred date (optional)</label><input name="preferredAt" type="date" className="input" min={new Date().toISOString().slice(0,10)}/></div>
    <div><label className="label">Contact phone</label><input name="contactPhone" required className="input" placeholder="+237..."/></div>
    {error && <p className="text-sm text-red-600">{error}</p>}
    <button disabled={busy} className="btn btn-primary w-full">{busy ? "Sending request…" : "Send service request"}</button>
  </form>;
}
