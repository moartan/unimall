import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiPhone, FiUser, FiLock } from 'react-icons/fi';
import { useCpanel } from '../../context/CpanelProvider';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
];

export default function AddEmployee() {
  const navigate = useNavigate();
  const { api, user } = useCpanel();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
    country: '',
    gender: '',
    notes: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        employeeRole: form.role,
        country: form.country,
        gender: form.gender,
      };
      await api.post('/cpanel/employees', payload);
      setStatus({
        loading: false,
        error: '',
        success: 'Employee created successfully. A welcome notification was sent.',
      });
      setForm({ name: '', email: '', phone: '', role: 'admin', country: '', gender: '', notes: '' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create employee.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  if (user && user.employeeRole !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl shadow-soft p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-2xl">
            🔒
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Access denied</h2>
          <p className="text-slate-600 text-base">
            You don&apos;t have permissions to access this page. Contact an administrator to get access or return to the dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate('/cpanel/dashboard')}
            className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">Add Employee</h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">Invite a team member and assign a role.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Full Name *</label>
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
                <FiUser className="text-text-secondary" />
                <input
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Employee name"
                  className="w-full bg-transparent focus:outline-none text-text-primary dark:text-text-light"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Role *</label>
              <select
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Email *</label>
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
                <FiMail className="text-text-secondary" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@company.com"
                  className="w-full bg-transparent focus:outline-none text-text-primary dark:text-text-light"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Phone</label>
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
                <FiPhone className="text-text-secondary" />
                <input
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+252 ..."
                  className="w-full bg-transparent focus:outline-none text-text-primary dark:text-text-light"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Country</label>
              <input
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Country"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional info or permissions"
                className="w-full min-h-[120px] rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>

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

            <div className="md:col-span-2 pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm({ name: '', email: '', phone: '', role: 'admin', country: '', gender: '', notes: '' })}
                className="px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={status.loading}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition disabled:opacity-70"
              >
                {status.loading ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>

        <aside className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Preview</h3>
          <div className="rounded-xl border border-primary/10 bg-light-bg dark:bg-dark-hover p-4 space-y-2">
            <div className="text-sm text-text-secondary dark:text-text-light/70">Name</div>
            <div className="text-base font-semibold text-text-primary dark:text-text-light">
              {form.name || 'Employee name'}
            </div>
            <div className="text-sm text-text-secondary dark:text-text-light/70">Role</div>
            <div className="text-base font-semibold text-text-primary dark:text-text-light">
              {form.role}
            </div>
            <div className="text-sm text-text-secondary dark:text-text-light/70">Status</div>
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {form.status}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
