import { useState } from 'react';

const mockEmail = {
  current: 'mdartan4@gmail.com',
  verified: true,
};

export default function EmailVerification() {
  const [email, setEmail] = useState(mockEmail.current);
  const [verified, setVerified] = useState(mockEmail.verified);

  const handleSendVerification = () => {
    setVerified(false);
    // trigger verification flow
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    setVerified(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Email & Verification</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink dark:text-text-light">Current Email</p>
            <p className="text-sm text-muted dark:text-text-light/80">{mockEmail.current}</p>
          </div>
          {verified ? (
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
              onChange={handleChangeEmail}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
            />
          </label>
          <p className="text-xs text-muted dark:text-text-light/70">
            Change your primary email and re-verify. If you keep the same email, just send a new verification link.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSendVerification}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover"
          >
            Send Verification
          </button>
          <button className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary">
            Save Email
          </button>
        </div>
      </div>
    </div>
  );
}
