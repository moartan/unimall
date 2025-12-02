import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useCpanel } from '../../context/CpanelProvider';

const statusTone = (status) => (status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700');

export default function EmployeeList() {
  const navigate = useNavigate();
  const { api, user } = useCpanel();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (user && user.employeeRole !== 'admin') {
      setLoading(false);
      return;
    }
    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/cpanel/employees');
        setEmployees(
          (data?.users || []).map((u) => ({
            id: u._id,
            name: u.name || '—',
            email: u.email || '—',
            phone: u.phone || '—',
            role: u.employeeRole ? u.employeeRole.toUpperCase() : 'EMPLOYEE',
            status: u.status === 'block' ? 'Blocked' : 'Active',
            hired: u.createdAt,
            code: u.userCode || '—',
          })),
        );
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load employees.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [api, user]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = query.toLowerCase();
      const matchesQuery = e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.phone.toLowerCase().includes(q);
      const matchesStatus = status === 'all' ? true : e.status.toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [employees, query, status]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'Active').length;
    const blocked = employees.filter((e) => e.status === 'Blocked').length;
    return { total, active, blocked };
  }, [employees]);

  const toggleStatus = async (id, current) => {
    const confirmMsg =
      current === 'Active'
        ? 'Are you sure you want to block this employee?'
        : 'Are you sure you want to activate this employee?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const nextStatus = current === 'Active' ? 'block' : 'active';
      await api.patch(`/cpanel/users/${id}/status`, { status: nextStatus });
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: nextStatus === 'block' ? 'Blocked' : 'Active' } : e)),
      );
      if (selected?.id === id) {
        setSelected((prev) => ({ ...prev, status: nextStatus === 'block' ? 'Blocked' : 'Active' }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/cpanel/users/${id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-4">
      {user?.employeeRole !== 'admin' ? (
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
      ) : (
        <>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="grid gap-3 md:grid-cols-3 flex-1">
          <StatCard title="Total Employees" value={stats.total} />
          <StatCard title="Active" value={stats.active} tone="success" />
          <StatCard title="Blocked" value={stats.blocked} tone="danger" />
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition">
          + Add Employee
        </button>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-primary/10">
          <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
            <FiSearch className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full bg-transparent focus:outline-none text-sm text-text-primary dark:text-text-light"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f6f8fb] text-slate-600 uppercase text-[12px] tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">
                    Loading employees...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-text-primary">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-lg">
                          {e.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[16px]">{e.name}</div>
                          <div className="text-sm text-slate-500">{e.code || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-primary">{e.email}</td>
                    <td className="px-4 py-4 text-text-primary font-semibold">{e.role}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(e.id, e.status)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          e.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {e.status}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      {e.hired ? dayjs(e.hired).format('MMM D, YYYY') : '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelected(e)}
                          className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">
                    No employees match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">EMPLOYEE</p>
                <h3 className="text-2xl font-bold text-slate-900">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.code}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-800 text-xl"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Email:</span> {selected.email}</p>
              <p><span className="font-semibold">Phone:</span> {selected.phone}</p>
              <p><span className="font-semibold">Role:</span> {selected.role}</p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selected.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {selected.status}
                </span>
              </p>
              <p><span className="font-semibold">Joined:</span> {selected.hired ? dayjs(selected.hired).format('MMM D, YYYY') : '—'}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => toggleStatus(selected.id, selected.status)}
                className="px-4 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition"
              >
                {selected.status === 'Active' ? 'Block User' : 'Activate User'}
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      ) : null}
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, tone = 'default', strong }) {
  const toneMap = {
    default: 'bg-light-card dark:bg-dark-card border border-primary/10',
    success: 'bg-emerald-50 border border-emerald-100',
    danger: 'bg-rose-50 border border-rose-100',
  };
  return (
    <div className={`rounded-2xl p-4 shadow-soft ${toneMap[tone] || toneMap.default}`}>
      <p className="text-sm font-semibold text-text-secondary dark:text-text-light/70 uppercase tracking-wide">{title}</p>
      <div className={`text-3xl font-extrabold mt-2 ${strong ? 'text-text-primary' : 'text-text-primary dark:text-text-light'}`}>
        {value}
      </div>
    </div>
  );
}
