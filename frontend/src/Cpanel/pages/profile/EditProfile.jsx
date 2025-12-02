import { useEffect, useMemo, useState } from 'react';
import { useCpanel } from '../../context/CpanelProvider';

const countries = [
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
];

export default function EditProfile() {
  const { user, api, setUser } = useCpanel();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    gender: '',
    role: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      gender: user.gender || '',
      role: user.employeeRole ? user.employeeRole.toUpperCase() : user.role || '',
    });
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
      };
      if (form.country) payload.country = form.country;
      if (form.gender) payload.gender = form.gender;
      const { data } = await api.put('/employee/profile', payload);
      if (data?.user) {
        setUser(data.user);
      }
      setStatus({ loading: false, error: '', success: 'Profile updated successfully.' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update profile.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      gender: user.gender || '',
      role: user.employeeRole ? user.employeeRole.toUpperCase() : user.role || '',
    });
    setStatus({ loading: false, error: '', success: '' });
  };

  const roleLabel = useMemo(() => {
    if (user?.employeeRole) return user.employeeRole.toUpperCase();
    return user?.role || '—';
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Edit Profile</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Full Name" value={form.name} onChange={handleChange('name')} required />
          <Field
            label="Email Address"
            value={form.email}
            type="email"
            disabled
            helper="Email cannot be changed here."
          />
          <Field label="Phone Number" value={form.phone} onChange={handleChange('phone')} />
          <CountrySelect label="Country" value={form.country} onChange={handleChange('country')} />
          <SelectField
            label="Gender"
            value={form.gender}
            onChange={handleChange('gender')}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
          />
          <Field label="Role" value={roleLabel} disabled helper="Role is managed by administrators." />

          {status.error ? (
            <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {status.error}
            </div>
          ) : null}
          {status.success ? (
            <div className="md:col-span-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {status.success}
            </div>
          ) : null}

          <div className="md:col-span-2 mt-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status.loading}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover disabled:opacity-70"
            >
              {status.loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled = false, helper, required = false }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={disabled}
        required={required}
        className={`rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      />
      {helper ? <span className="text-xs text-muted dark:text-text-light/70">{helper}</span> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
      >
        {!value ? (
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CountrySelect({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.name}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted dark:text-text-light/70">Select your country.</span>
    </label>
  );
}
