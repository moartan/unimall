const mockUser = {
  fullName: 'System Admin',
  email: 'mdartan4@gmail.com',
  phone: '00905376054336',
  country: 'Somalia',
  gender: 'male',
  role: 'Administrator',
};

const countries = [
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
];

export default function EditProfile() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Edit Profile</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full Name" defaultValue={mockUser.fullName} />
          <Field label="Email Address" defaultValue={mockUser.email} type="email" disabled helper="Email cannot be changed here." />
          <Field label="Phone Number" defaultValue={mockUser.phone} />
          <CountrySelect label="Country" defaultValue={mockUser.country} />
          <SelectField
            label="Gender"
            defaultValue={mockUser.gender}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
          />
          <Field label="Role" defaultValue={mockUser.role} disabled helper="Role is managed by administrators." />
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover">
            Save Changes
          </button>
          <button className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = 'text', disabled = false, helper }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={disabled}
        className={`rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      />
      {helper ? <span className="text-xs text-muted dark:text-text-light/70">{helper}</span> : null}
    </label>
  );
}

function SelectField({ label, defaultValue, options }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <select
        defaultValue={defaultValue}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CountrySelect({ label, defaultValue }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <select
        defaultValue={defaultValue}
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
