export default function SecuritySection({ pwdForm, onChange, onSubmit, saving, msg }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Security</h2>
        {msg.success && <span className="text-sm text-green-600 font-semibold">{msg.success}</span>}
        {msg.error && !msg.success && <span className="text-sm text-red-600 font-semibold">{msg.error}</span>}
      </div>
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={onSubmit}>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={pwdForm.currentPassword}
            onChange={(e) => onChange((p) => ({ ...p, currentPassword: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={pwdForm.newPassword}
            onChange={(e) => onChange((p) => ({ ...p, newPassword: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirm"
            value={pwdForm.confirm}
            onChange={(e) => onChange((p) => ({ ...p, confirm: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        <div className="col-span-1 md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
