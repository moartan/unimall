export default function SmsTwoFASection() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7 space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">SMS & 2FA</h2>
      <p className="text-sm text-slate-600">
        Two-factor via SMS is not enabled for customer accounts yet. We can hook this up once the
        backend endpoints are ready.
      </p>
    </section>
  );
}
