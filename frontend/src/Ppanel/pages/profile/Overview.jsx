export default function Overview({ user, displayName }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Name" value={displayName} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Country" value={user?.country || "—"} />
        <InfoRow label="Phone" value={user?.phone || "—"} />
        <InfoRow label="Gender" value={user?.gender || "—"} />
        <InfoRow label="Status" value={user?.status || "active"} />
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <p className="text-sm text-slate-800 font-semibold">{value || "—"}</p>
    </div>
  );
}
