import { useEffect, useState } from 'react';

export default function Header({ onMenuClick }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('theme') === 'dark';
  });

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

          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-light-card text-ink hover:bg-accent-bg hover:text-primary dark:bg-dark-card dark:text-text-light"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6.5 10.5a5.5 5.5 0 0 1 11 0c0 2 .45 3.11.92 3.86A1 1 0 0 1 17.6 16H6.4a1 1 0 0 1-.82-1.64c.47-.75.92-1.86.92-3.86Z" />
              <path d="M10 18.5a2 2 0 0 0 4 0" strokeLinecap="round" />
            </svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary shadow-accent" />
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-border bg-light-card px-3 py-1.5 dark:bg-dark-card md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(2,159,174,0.12)] text-primary font-semibold">
              MA
            </div>
            <div>
              <p className="text-sm font-semibold text-ink dark:text-text-light">Mohamed Artan</p>
              <p className="text-xs text-muted dark:text-text-light/70">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
