import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiActivity, FiLock, FiSettings, FiLogOut, FiBell, FiClock } from 'react-icons/fi';
import { useCpanel } from '../context/CpanelProvider';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout, api } = useCpanel();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('theme') === 'dark';
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.dataset.theme = 'dark';
      window.localStorage.setItem('theme', 'dark');
    } else {
      delete root.dataset.theme;
      window.localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToProfileTab = (tab) => {
    navigate(`/cpanel/profile?tab=${tab}`);
    setProfileOpen(false);
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError('');
    try {
      const { data } = await api.get('/employee/notifications');
      setNotifications(data?.notifications || []);
    } catch (err) {
      setNotifError(err?.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifOpen]);

  const markAllRead = async () => {
    try {
      await user?.api?.post?.('/employee/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const initials =
    user?.name?.trim()?.split(' ')?.map((n) => n[0]?.toUpperCase()).join('').slice(0, 2) ||
    user?.email?.slice(0, 2)?.toUpperCase() ||
    'NA';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-light-card dark:bg-dark-card dark:border-transparent dark:shadow-[0_8px_22px_-20px_rgba(0,0,0,0.65)] shadow-soft">
      <div className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-accent-bg text-ink hover:text-primary hover:border-[rgba(2,159,174,0.35)] dark:bg-dark-hover dark:text-text-light md:hidden"
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-accent-bg text-ink hover:border-[rgba(2,159,174,0.35)] hover:text-primary dark:bg-dark-hover dark:text-text-light md:hidden"
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="6" />
            <path d="m16.5 16.5 2.5 2.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative hidden w-full max-w-md md:max-w-lg md:block">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6" />
              <path d="m16.5 16.5 2.5 2.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search orders, customers, invoices..."
            className="w-full h-10 rounded-xl border border-border bg-accent-bg px-10 text-sm text-ink placeholder:text-muted/70 outline-none ring-2 ring-transparent transition focus:border-[rgba(2,159,174,0.35)] focus:ring-[rgba(2,159,174,0.15)] dark:bg-dark-hover dark:text-text-light"
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-accent-bg text-ink transition hover:border-[rgba(2,159,174,0.35)] hover:text-primary dark:bg-dark-hover dark:text-text-light"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 12.5A8.5 8.5 0 1 1 11.5 4a6.5 6.5 0 0 0 8.5 8.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.5 3.5M18.5 18.5 20 20M5 19l-1.5 1.5M19 5l1.5-1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((p) => !p);
                setProfileOpen(false);
              }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-light-card text-ink hover:bg-accent-bg hover:text-primary dark:bg-dark-card dark:text-text-light"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6.5 10.5a5.5 5.5 0 0 1 11 0c0 2 .45 3.11.92 3.86A1 1 0 0 1 17.6 16H6.4a1 1 0 0 1-.82-1.64c.47-.75.92-1.86.92-3.86Z" />
                <path d="M10 18.5a2 2 0 0 0 4 0" strokeLinecap="round" />
              </svg>
              {unreadCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-accent">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>
            {notifOpen ? (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-border bg-light-card shadow-soft dark:bg-dark-card dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3 text-sm font-semibold text-ink dark:border-slate-700 dark:text-text-light">
                  <span>Notifications</span>
                  <button onClick={markAllRead} className="text-[11px] font-semibold text-primary hover:underline">Mark all read</button>
                </div>
                <div className="divide-y divide-border/80 dark:divide-slate-700 max-h-96 overflow-y-auto">
                  {notifLoading ? (
                    <div className="px-4 py-3 text-sm text-muted">Loading...</div>
                  ) : notifError ? (
                    <div className="px-4 py-3 text-sm text-red-600">{notifError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted">No notifications.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-primary/5 dark:hover:bg-dark-hover">
                        <div className={`mt-0.5 ${n.read ? 'text-muted' : 'text-primary'}`}>
                          <FiBell />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-ink dark:text-text-light">{n.title || 'Notification'}</p>
                          <p className="text-xs text-muted dark:text-text-light/70">{n.body || ''}</p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted dark:text-text-light/60">
                            <FiClock /> {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative hidden md:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 rounded-xl border border-border bg-light-card px-3 py-1.5 text-sm font-semibold text-ink shadow-soft transition hover:border-[rgba(2,159,174,0.35)] dark:bg-dark-card dark:text-text-light"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Profile'}
                  className="h-9 w-9 rounded-lg object-cover border border-border"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(2,159,174,0.12)] text-primary font-semibold">
                  {initials}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight text-ink dark:text-text-light">
                  {user?.name || '—'}
                </p>
                <p className="text-[11px] leading-tight text-muted dark:text-text-light/70">
                  {user?.employeeRole ? user.employeeRole.toUpperCase() : 'Employee'}
                </p>
              </div>
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-border bg-light-card shadow-soft dark:bg-dark-card dark:border-slate-700">
                <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 dark:border-slate-700">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'Profile'}
                      className="h-11 w-11 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white text-base font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="leading-tight">
                    <p className="text-base font-bold text-ink dark:text-text-light">
                      {user?.name || '—'}
                    </p>
                    <p className="text-xs text-muted dark:text-text-light/80">{user?.email || '—'}</p>
                  </div>
                </div>
                {!user?.emailVerified ? (
                  <button
                    type="button"
                    onClick={() => goToProfileTab('email')}
                    className="border-b border-border bg-white px-4 py-2 text-red-600 text-sm font-semibold flex items-center gap-2 w-full text-left hover:bg-red-50"
                  >
                    ⚠️ <span>Please Verify</span>
                  </button>
                ) : null}
                <div className="px-3 py-3 text-ink dark:text-text-light">
                  <button
                    type="button"
                    onClick={() => goToProfileTab('overview')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary/10 dark:hover:bg-dark-hover"
                  >
                    <FiUser className="text-primary" /> Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => goToProfileTab('sessions')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary/10 dark:hover:bg-dark-hover"
                  >
                    <FiActivity className="text-primary" /> Sessions
                  </button>
                  <button
                    type="button"
                    onClick={() => goToProfileTab('security')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary/10 dark:hover:bg-dark-hover"
                  >
                    <FiLock className="text-primary" /> Security
                  </button>
                  <button
                    type="button"
                    onClick={() => goToProfileTab('edit')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary/10 dark:hover:bg-dark-hover"
                  >
                    <FiSettings className="text-primary" /> Settings
                  </button>
                </div>
                <div className="border-t border-border px-3 py-3 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-[#3a1f1f]"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
