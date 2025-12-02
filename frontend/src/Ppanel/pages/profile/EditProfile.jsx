const genderOptions = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function EditProfile({
  form,
  onChange,
  onReset,
  onSubmit,
  saving,
  success,
  error,
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Profile Details</h2>
        {success && <span className="text-sm text-green-600 font-semibold">{success}</span>}
        {error && !success && <span className="text-sm text-red-600 font-semibold">{error}</span>}
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Your name"
            required
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-500 cursor-not-allowed"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Country"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Phone number"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
