import { useState } from 'react';
import { useCpanel } from '../../context/CpanelProvider';

export default function Security() {
  const { api } = useCpanel();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.', success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      await api.put('/employee/profile/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus({ loading: false, error: '', success: 'Password updated successfully.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update password.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const handleCancel = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setStatus({ loading: false, error: '', success: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Security</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-4">
        <h3 className="text-lg font-semibold text-ink dark:text-text-light">Change Password</h3>
        <p className="text-sm text-muted dark:text-text-light/80">
          Update your password regularly to keep your account secure.
        </p>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={handleChange('currentPassword')}
            required
          />
          <div />
          <Field
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={handleChange('newPassword')}
            helper="Use at least 8 characters with a mix of symbols and numbers."
            required
          />
          <Field
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
          />

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

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status.loading}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover disabled:opacity-70"
            >
              {status.loading ? 'Updating...' : 'Update Password'}
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

function Field({ label, type = 'text', helper, value, onChange, required = false }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
      />
      {helper ? <span className="text-xs text-muted dark:text-text-light/70">{helper}</span> : null}
    </label>
  );
}
