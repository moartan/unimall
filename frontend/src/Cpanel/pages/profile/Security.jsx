export default function Security() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Security</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-4">
        <h3 className="text-lg font-semibold text-ink dark:text-text-light">Change Password</h3>
        <p className="text-sm text-muted dark:text-text-light/80">
          Update your password regularly to keep your account secure.
        </p>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Current Password" type="password" />
          <div />
          <Field label="New Password" type="password" helper="Use at least 8 characters with a mix of symbols and numbers." />
          <Field label="Confirm New Password" type="password" />
        </form>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover">
            Update Password
          </button>
          <button className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', helper }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink dark:text-text-light">
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-card dark:text-text-light"
      />
      {helper ? <span className="text-xs text-muted dark:text-text-light/70">{helper}</span> : null}
    </label>
  );
}
