import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useCpanel } from '../../context/CpanelProvider';

export default function Sessions() {
  const { api } = useCpanel();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/employee/sessions');
        setSessions(data?.sessions || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load sessions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [api]);

  const handleRevoke = async (id) => {
    try {
      await api.delete(`/employee/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to revoke session.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Sessions & Devices</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-3">
          <h3 className="text-lg font-semibold text-ink dark:text-text-light">Devices</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : (
            <div className="space-y-2 text-sm text-ink dark:text-text-light">
              {sessions.length === 0 ? (
                <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-dark-card text-muted">
                  No active sessions.
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-dark-card"
                  >
                    <div>
                      <p className="font-semibold">Session: {s._id.slice(-6)}</p>
                      <p className="text-xs text-muted dark:text-text-light/70">
                        IP: {s.ip || '—'} · {s.userAgent || '—'}
                      </p>
                      <p className="text-[11px] text-muted dark:text-text-light/60">
                        Last used: {s.lastUsedAt ? dayjs(s.lastUsedAt).format('MMM D, YYYY h:mm A') : '—'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevoke(s._id)}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-3">
          <h3 className="text-lg font-semibold text-ink dark:text-text-light">API Access</h3>
          <div className="space-y-2 text-sm text-ink dark:text-text-light">
            <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-dark-card">
              <p className="font-semibold">Employee API</p>
              <p className="text-xs text-muted dark:text-text-light/70">Protected by JWT + refresh tokens.</p>
              <p className="text-xs font-semibold text-primary">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
