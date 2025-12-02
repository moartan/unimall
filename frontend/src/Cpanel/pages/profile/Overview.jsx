import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCpanel } from '../../context/CpanelProvider';

export default function Overview() {
  const { user, loading } = useCpanel();
  const navigate = useNavigate();

  const safeUser = useMemo(
    () => ({
      name: user?.name || '—',
      email: user?.email || '—',
      phone: user?.phone || '—',
      country: user?.country || '—',
      gender: user?.gender || '—',
      role: user?.employeeRole ? user.employeeRole.toUpperCase() : user?.role || '—',
      avatar: user?.avatar || '',
      initials:
        user?.name
          ?.trim()
          ?.split(' ')
          ?.map((n) => n[0]?.toUpperCase())
          ?.join('')
          ?.slice(0, 2) ||
        user?.email?.slice(0, 2)?.toUpperCase() ||
        'NA',
    }),
    [user],
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-28 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
          <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Account Overview</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60">
            <h3 className="text-lg font-semibold text-ink dark:text-text-light">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-4 text-sm text-ink dark:text-text-light md:grid-cols-2">
              <InfoRow label="Full Name" value={safeUser.name} />
              <InfoRow label="Email Address" value={safeUser.email} />
              <InfoRow label="Phone Number" value={safeUser.phone} />
              <InfoRow label="Country" value={safeUser.country} />
              <InfoRow label="Gender" value={safeUser.gender} />
              <InfoRow label="Role" value={safeUser.role} />
            </div>
          </div>

          <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60">
            <h3 className="text-lg font-semibold text-ink dark:text-text-light">Account Details</h3>
            <p className="mt-3 text-sm text-muted dark:text-text-light/80">
              This account is linked with your UniMall admin system. You can manage your account settings, security preferences,
              and email verification from the tabs above.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/cpanel/profile?tab=edit')}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => navigate('/cpanel/profile?tab=security')}
                className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary"
              >
                Manage Security
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 flex flex-col items-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#b8e2e8] text-primary text-3xl font-bold overflow-hidden border border-border">
            {safeUser.avatar ? (
              <img src={safeUser.avatar} alt={safeUser.name} className="h-full w-full object-cover" />
            ) : (
              safeUser.initials
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-ink dark:text-text-light">{safeUser.name}</p>
            <p className="text-sm text-muted dark:text-text-light/80">{safeUser.email}</p>
          </div>
          <span className="mt-3 rounded-full bg-[#b8e2e8] px-3 py-1 text-xs font-semibold text-ink dark:text-text-light">
            {safeUser.role}
          </span>
          <button
            type="button"
            onClick={() => navigate('/cpanel/profile?tab=image')}
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary"
          >
            Change Profile Image
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 text-muted dark:text-text-light/80">
      <span className="text-sm font-semibold text-ink dark:text-text-light">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
