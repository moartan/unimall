import { useMemo, useState } from 'react';
import { FiSearch, FiMail, FiPhone, FiEye } from 'react-icons/fi';

const mockCustomers = [
  { id: 1, name: 'Mohamed Artan', email: 'mohamed@example.com', phone: '+252 90 123 4567', orders: 18, spent: 9794, status: 'Active', joined: '2024-03-01' },
  { id: 2, name: 'Amina Warsame', email: 'amina@example.com', phone: '+252 61 234 5678', orders: 12, spent: 6240, status: 'Active', joined: '2024-05-12' },
  { id: 3, name: 'Rahim Nur', email: 'rahim@example.com', phone: '+252 63 321 9999', orders: 6, spent: 1890, status: 'Blocked', joined: '2023-12-20' },
  { id: 4, name: 'Lina Ahmed', email: 'lina@example.com', phone: '+252 90 456 7788', orders: 4, spent: 920, status: 'Active', joined: '2024-01-04' },
  { id: 5, name: 'Carlos Pinto', email: 'carlos@example.com', phone: '+1 415 555 1234', orders: 9, spent: 3120, status: 'Active', joined: '2024-02-18' },
];

const statusTone = (status) => (status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700');

export default function CustomerList() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [customers, setCustomers] = useState(mockCustomers);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
      const matchesStatus = status === 'all' ? true : c.status.toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, status]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'Active').length;
    const blocked = customers.filter((c) => c.status === 'Blocked').length;
    const ltv = customers.reduce((sum, c) => sum + c.spent, 0);
    return { total, active, blocked, ltv };
  }, [customers]);

  const toggleStatus = (id) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Active' ? 'Blocked' : 'Active' } : c
      )
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
                <th className="text-left px-4 py-3">Orders</th>
                <th className="text-left px-4 py-3">Total Spent</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-primary/10">
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    <div className="font-semibold">{c.name}</div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-light/70">
                      <FiMail /> {c.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-light/70">
                      <FiPhone /> {c.phone}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">{c.orders}</td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">${c.spent.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(c.status)} transition`}
                    >
                      {c.status}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
                    {new Date(c.joined).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition">
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
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
