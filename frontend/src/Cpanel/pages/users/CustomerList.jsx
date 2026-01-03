import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiMail, FiPhone, FiEye, FiSlash, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useCpanel } from '../../context/CpanelProvider';
import { getCustomers } from '../../api/catalog';

const statusTone = (status) => (status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700');

export default function CustomerList() {
  const { api, user } = useCpanel();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchCustomers = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getCustomers(api, { limit: 200 });
        if (!mounted) return;
        setCustomers(
          (data?.users || []).map((u) => ({
            id: u._id,
            name: u.name || '—',
            email: u.email || '—',
            phone: u.phone || '—',
            status: u.status === 'block' ? 'Blocked' : 'Active',
            joined: u.createdAt,
            userCode: u.userCode || '—',
            avatar: u.avatar?.url || u.profileImage?.url,
            ordersCount: u.ordersCount || 0,
            totalSpent: u.totalSpent || 0,
            totalBenefit: u.totalBenefit || u.benefit || 0,
          })),
        );
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'Failed to load customers.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCustomers();
    return () => {
      mounted = false;
    };
  }, [api]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesQuery =
        !q ||
        [c.name, c.email, c.phone, c.userCode]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q));
      const matchesStatus = status === 'all' ? true : c.status.toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, status]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'Active').length;
    const blocked = customers.filter((c) => c.status === 'Blocked').length;
    const ltv = customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
    return { total, active, blocked, ltv };
  }, [customers]);

  const handleToggleStatus = async (customer) => {
    if (!user || user.employeeRole !== 'admin') {
      alert('Only admins can change customer status.');
      return;
    }
    const next = customer.status === 'Active' ? 'block' : 'active';
    try {
      await api.patch(`/cpanel/users/${customer.id}/status`, { status: next });
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: next === 'block' ? 'Blocked' : 'Active' } : c)),
      );
      if (selected?.id === customer.id) {
        setSelected((prev) => ({ ...prev, status: next === 'block' ? 'Blocked' : 'Active' }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (customer) => {
    if (!user || user.employeeRole !== 'admin') {
      alert('Only admins can delete customers.');
      return;
    }
    if (!window.confirm('Delete this customer permanently?')) return;
    try {
      await api.delete(`/cpanel/users/${customer.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      if (selected?.id === customer.id) setSelected(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete customer.');
    }
  };

  const renderAvatar = (customer) => {
    if (customer.avatar) {
      return <img src={customer.avatar} alt={customer.name} className="h-12 w-12 rounded-full object-cover" />;
    }
    const initials =
      customer.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CU';
    return (
      <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-lg">
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Customers" value={stats.total} />
        <StatCard title="Active" value={stats.active} tone="success" />
        <StatCard title="Blocked" value={stats.blocked} tone="danger" />
        <StatCard title="Lifetime Value" value={`$${stats.ltv.toLocaleString()}`} strong />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-primary/10">
          <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
            <FiSearch className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search customers..."
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
            <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    Loading customers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-light-bg dark:hover:bg-dark-hover">
                    <td className="px-4 py-4 text-text-primary dark:text-text-light">
                      <div className="flex items-center gap-3">
                        {renderAvatar(c)}
                        <div>
                          <div className="font-semibold text-[16px]">{c.name}</div>
                          <div className="text-sm text-text-secondary dark:text-text-light/70">{c.userCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-primary dark:text-text-light">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-text-secondary" /> {c.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-primary dark:text-text-light">
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-text-secondary" /> {c.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(c.status)} transition`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
                      {c.joined ? dayjs(c.joined).format('M/D/YYYY') : '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelected(c)}
                          className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition"
                          title="Quick view"
                        >
                          <FiEye />
                        </button>
                        {user?.employeeRole === 'admin' ? (
                          <>
                            <button
                              onClick={() => handleToggleStatus(c)}
                              className="p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition"
                              title={c.status === 'Active' ? 'Block customer' : 'Activate customer'}
                            >
                              <FiSlash />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                              title="Delete customer"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No customers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">CUSTOMER</p>
                <h3 className="text-2xl font-bold text-slate-900">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.userCode}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-800 text-xl">
                ×
              </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm text-slate-700">
              <p className="flex items-center gap-2">
                  <FiMail className="text-slate-400" />
                  <span>{selected.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FiPhone className="text-slate-400" />
                  <span>{selected.phone}</span>
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusTone(selected.status)}`}>
                    {selected.status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Joined:</span>{' '}
                  {selected.joined ? dayjs(selected.joined).format('MMM D, YYYY') : '—'}
                </p>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Orders:</span> {selected.ordersCount ?? 0}
                </p>
                <p>
                  <span className="font-semibold">Total Spent:</span>{' '}
                  ${Number(selected.totalSpent || 0).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Benefit to company:</span>{' '}
                  ${Number(selected.totalBenefit || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {user?.employeeRole === 'admin' ? (
              <div className="mt-5 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => handleToggleStatus(selected)}
                  className="px-4 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition"
                >
                  {selected.status === 'Active' ? 'Block Customer' : 'Activate Customer'}
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                >
                  Delete Customer
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
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
