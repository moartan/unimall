import { useEffect, useMemo, useState } from "react";
import { usePpanel } from "../../../context/PpanelProvider.jsx";

const labelOptions = ["home", "work", "other"];

export default function DeliverySection() {
  const { api } = usePpanel();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "home",
    phone: "",
    country: "",
    state: "",
    city: "",
    line1: "",
    line2: "",
    note: "",
    isDefault: false,
  });

  const canSave = useMemo(
    () => form.phone && form.country && form.city && form.line1,
    [form.phone, form.country, form.city, form.line1],
  );

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/customer/addresses");
      setAddresses(data?.addresses || []);
      const defaultAddr = data?.addresses?.find((a) => a.isDefault);
      setSelectedId(defaultAddr?._id || data?.addresses?.[0]?._id || null);
    } catch (_err) {
      // ignore in checkout; user can add
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!canSave) {
      setShowWarning(true);
      return;
    }
    setSaving(true);
    setShowWarning(false);
    try {
      const { data } = await api.post("/customer/addresses", form);
      setAddresses((prev) => [data.address, ...prev]);
      setSelectedId(data.address._id);
      setShowForm(false);
      setForm({
        label: "home",
        phone: "",
        country: "",
        state: "",
        city: "",
        line1: "",
        line2: "",
        note: "",
        isDefault: false,
      });
    } catch (_err) {
      setShowWarning(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowWarning(false);
    setForm({
      label: "home",
      phone: "",
      country: "",
      state: "",
      city: "",
      line1: "",
      line2: "",
      note: "",
      isDefault: false,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
      <p className="text-xs font-semibold text-slate-500">STEP 2</p>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Delivery address</h2>
          <p className="text-slate-600">Select where you’d like the order delivered.</p>
        </div>
        <button
          className="text-primary font-semibold text-sm"
          onClick={() => (window.location.href = "/profile?tab=addresses")}
        >
          Manage addresses
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {!showForm && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className={`w-full rounded-2xl border px-4 py-3 flex items-start gap-3 cursor-pointer ${
                  selectedId === addr._id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-slate-50 hover:border-primary/60"
                }`}
              >
                <input
                  type="radio"
                  name="selectedAddress"
                  checked={selectedId === addr._id}
                  onChange={() => setSelectedId(addr._id)}
                  className="mt-1 accent-primary"
                />
                <div className="text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    {addr.label?.toUpperCase()}
                    {addr.isDefault && (
                      <span className="text-xs font-semibold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-lg">
                        Default
                      </span>
                    )}
                  </p>
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.city} {addr.state && `, ${addr.state}`} {addr.country}
                  </p>
                  <p className="text-slate-500">Phone: {addr.phone}</p>
                  {addr.note && <p className="text-slate-500">Note: {addr.note}</p>}
                </div>
              </label>
            ))}
            <button
              className="w-full h-12 rounded-full border border-slate-200 text-slate-700 font-semibold hover:border-primary hover:text-primary transition"
              onClick={() => setShowForm(true)}
            >
              + Add new address
            </button>
          </div>
        )}

        {!showForm && addresses.length === 0 && (
          <>
            <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-500 font-semibold">
              No saved addresses yet. Add one to continue checkout.
            </div>
            <button
              className="w-full h-12 rounded-full border border-slate-200 text-slate-700 font-semibold hover:border-primary hover:text-primary transition"
              onClick={() => setShowForm(true)}
            >
              + Add new address
            </button>
          </>
        )}

        {showForm && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleAdd}>
              <InputSelect
                label="Address label"
                name="label"
                value={form.label}
                onChange={handleChange}
                options={labelOptions}
              />
              <Input
                label="Phone number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +252 61 000 0000"
              />
              <Input label="Country" name="country" value={form.country} onChange={handleChange} placeholder="Country" />
              <Input
                label="State / Region"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State / Region"
              />
              <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="City" />
              <Input
                label="Address line 1"
                name="line1"
                value={form.line1}
                onChange={handleChange}
                placeholder="Address line 1"
              />
              <Input
                label="Address line 2"
                name="line2"
                value={form.line2}
                onChange={handleChange}
                placeholder="Apartment, floor, landmark"
              />
              <Input
                label="Delivery notes"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="e.g. 'Call when you arrive'"
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Set as default shipping address
              </label>
              <div className="flex items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={!canSave || saving}
                  className="px-5 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save address"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-rose-500 font-semibold text-sm hover:text-rose-600"
                >
                  Cancel
                </button>
              </div>
              {showWarning && (
                <div className="md:col-span-2 w-full rounded-2xl bg-amber-50 text-amber-800 px-4 py-3 text-sm font-semibold border border-amber-100">
                  Please complete required fields.
                </div>
              )}
            </form>
          </div>
        )}

        {showWarning && !showForm && (
          <div className="w-full rounded-2xl bg-amber-50 text-amber-800 px-4 py-3 text-sm font-semibold border border-amber-100">
            Please add and select a delivery address before proceeding.
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function InputSelect({ label, name, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
