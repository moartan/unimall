import { useEffect, useState } from 'react';
import { useCpanel } from '../../context/CpanelProvider';

export default function EmailVerification() {
  const { user, api } = useCpanel();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const sendChangeRequest = async () => {
    if (!email) {
      setStatus({ loading: false, error: 'Please enter an email.', success: '' });
      return;
    }
    if (email === user?.email && user?.emailVerified) {
      setStatus({ loading: false, error: '', success: 'Email is already verified.' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const { data } = await api.post('/auth/employee/email/change', { newEmail: email });
      setStatus({ loading: false, error: '', success: data?.message || 'Check your email for the confirmation link.' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send verification/change link.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const handleSendVerification = async () => {
    await sendChangeRequest();
  };

  const handleSaveEmail = async () => {
    await sendChangeRequest();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Email & Verification</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink dark:text-text-light">Current Email</p>
            <p className="text-sm text-muted dark:text-text-light/80">{user?.email || '—'}</p>
          </div>
          {user?.emailVerified ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Verified</span>
          ) : (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Unverified</span>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
            <span className="font-semibold">New Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
            />
          </label>
          <p className="text-xs text-muted dark:text-text-light/70">
            Change your primary email and re-verify. If you keep the same email, just send a new verification link.
          </p>
        </div>

        {status.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{status.error}</div>
        ) : null}
        {status.success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {status.success}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={status.loading}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover disabled:opacity-70"
          >
            {status.loading ? 'Sending...' : 'Send Verification'}
          </button>
          <button
            type="button"
            onClick={handleSaveEmail}
            disabled={status.loading}
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary disabled:opacity-70"
          >
            Save Email
          </button>
        </div>
      </div>
    </div>
  );
}
