import { useEffect, useMemo, useState } from "react";
import { usePpanel } from "../../context/PpanelProvider";

const labelOptions = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

export default function AddressesSection() {
  const { api } = usePpanel();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "home",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    note: "",
    isDefault: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const canAdd = useMemo(
    () => form.phone && form.line1 && form.city && form.country,
    [form.phone, form.line1, form.city, form.country],
  );

  const fetchAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/customer/addresses");
      setAddresses(data?.addresses || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const addAddress = async (e) => {
    e.preventDefault();
    if (!canAdd) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/customer/addresses", form);
      setAddresses((prev) => [data.address, ...prev]);
      setForm({
        label: "home",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        note: "",
        isDefault: false,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add address.");
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id) => {
    try {
      const target = addresses.find((a) => a._id === id);
      if (!target) return;
      const { data } = await api.put(`/customer/addresses/${id}`, { isDefault: true });
      setAddresses((prev) =>
        prev.map((a) => (a._id === id ? data.address : { ...a, isDefault: false })),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update address.");
    }
  };

  const removeAddress = async (id) => {
    try {
      await api.delete(`/customer/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete address.");
    }
  };

  const startEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label || "home",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      country: addr.country || "",
      note: addr.note || "",
      isDefault: !!addr.isDefault,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      label: "home",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      note: "",
      isDefault: false,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const { data } = await api.put(`/customer/addresses/${editingId}`, form);
      setAddresses((prev) => prev.map((a) => (a._id === editingId ? data.address : a)));
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update address.");
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Addresses</h2>
        {error && <span className="text-sm text-red-600 font-semibold">{error}</span>}
      </div>

      {loading ? (
        <div className="text-sm text-slate-600">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No addresses yet. Add one to continue.
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="text-sm text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">
                  {addr.label?.toUpperCase()}{" "}
                  {editingId === addr._id && (
                    <span className="text-xs text-primary font-semibold">(Editing)</span>
                  )}
                </p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city} {addr.state && `, ${addr.state}`} {addr.country}
                </p>
                <p>Phone: {addr.phone}</p>
                {addr.note && <p className="text-slate-500">Note: {addr.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEdit(addr)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 text-sm"
                >
                  Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr._id)}
                    className="px-3 py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white text-sm"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => removeAddress(addr._id)}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 text-sm"
                >
                  Delete
                </button>
                {addr.isDefault && (
                  <span className="text-xs font-semibold text-green-600 border border-green-200 bg-green-50 px-2 py-1 rounded-lg">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <h3 className="text-md font-semibold text-slate-900">
          {editingId ? "Edit address" : "Add new address"}
        </h3>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          onSubmit={editingId ? (e) => { e.preventDefault(); saveEdit(); } : addAddress}
        >
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Label</label>
            <select
              name="label"
              value={form.label}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {labelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Address line 1</label>
            <input
              name="line1"
              value={form.line1}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Address line 2</label>
            <input
              name="line2"
              value={form.line2}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-sm text-slate-700">
              Set as default
            </label>
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !canAdd}
              className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save address" : "Add address"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
