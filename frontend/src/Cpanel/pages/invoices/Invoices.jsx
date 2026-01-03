import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiEye, FiDownload, FiEdit2 } from 'react-icons/fi';

const invoices = [
  {
    id: '#INV-2048',
    customer: 'Mohamed Artan',
    email: 'mohamed@example.com',
    total: 9794,
    status: 'Paid',
    due: '2025-11-21',
    items: 4,
    source: 'Web',
    products: ['NovaBook Air 14', 'Aurora Buds X'],
  },
  {
    id: '#INV-2047',
    customer: 'Amina Warsame',
    email: 'amina@example.com',
    total: 1249,
    status: 'Sent',
    due: '2025-11-18',
    items: 3,
    source: 'Web',
    products: ['ZenNote 15'],
  },
  {
    id: '#INV-2046',
    customer: 'Rahim Nur',
    email: 'rahim@example.com',
    total: 449,
    status: 'Draft',
    due: '2025-11-22',
    items: 2,
    source: 'POS',
    products: ['Pulse Mini Speaker'],
  },
  {
    id: '#INV-2045',
    customer: 'Lina Ahmed',
    email: 'lina@example.com',
    total: 189,
    status: 'Overdue',
    due: '2025-11-05',
    items: 1,
    source: 'Marketplace',
    products: ['Aurora Buds X'],
  },
  {
    id: '#INV-2044',
    customer: 'Carlos Pinto',
    email: 'carlos@example.com',
    total: 729,
    status: 'Paid',
    due: '2025-11-10',
    items: 5,
    source: 'Storefront',
    products: ['Galaxy One Pro'],
  },
];

const statusTone = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-700';
    case 'Sent':
      return 'bg-blue-100 text-blue-700';
    case 'Draft':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-rose-100 text-rose-700';
  }
};

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'product', label: 'Product Match' },
  { key: 'refund', label: 'Refund/Cancel' },
  { key: 'due', label: 'Overdue' },
];

export default function Invoices() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = tabs.find((t) => t.key === searchParams.get('tab'))?.key || 'all';
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const q = query.toLowerCase();
      const matchesQuery =
        inv.id.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.products?.some((p) => p.toLowerCase().includes(q));
      const matchesStatus = status === 'all' ? true : inv.status.toLowerCase() === status;
      const matchesSource = source === 'all' ? true : inv.source.toLowerCase() === source;
      const matchesTab =
        tab === 'all'
          ? true
          : tab === 'product'
            ? inv.products?.some((p) => p.toLowerCase().includes(q))
            : tab === 'refund'
              ? ['overdue', 'cancelled', 'refunded'].includes(inv.status.toLowerCase())
              : tab === 'due'
                ? inv.status.toLowerCase() === 'overdue'
                : true;
      return matchesQuery && matchesStatus && matchesSource && matchesTab;
    });
  }, [query, status, source, tab]);

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'Paid').length;
    const sent = invoices.filter((i) => i.status === 'Sent').length;
    const draft = invoices.filter((i) => i.status === 'Draft').length;
    const overdue = invoices.filter((i) => i.status === 'Overdue').length;
    const gross = invoices.reduce((sum, i) => sum + i.total, 0);
    return { paid, sent, draft, overdue, gross };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Paid" value={stats.paid} tone="success" />
        <StatCard title="Sent" value={stats.sent} tone="info" />
        <StatCard title="Draft" value={stats.draft} tone="muted" />
        <StatCard title="Overdue" value={stats.overdue} tone="danger" />
        <StatCard title="Gross Revenue" value={`$${stats.gross.toLocaleString()}`} tone="default" strong />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <div className="p-4 border-b border-primary/10 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
              <FiSearch className="text-text-secondary" />
              <input
                type="text"
                placeholder="Search by invoice code or customer..."
                className="w-full bg-transparent focus:outline-none text-sm text-text-primary dark:text-text-light"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
              >
                <option value="all">All status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
              >
                <option value="all">All sources</option>
                <option value="web">Web</option>
                <option value="storefront">Storefront</option>
                <option value="marketplace">Marketplace</option>
                <option value="pos">POS</option>
              </select>
            </div>
          </div>

          <div className="pb-1 -mx-4">
            <div className="flex items-center gap-2 overflow-x-auto bg-[#f5f8fb] px-2 py-2 w-full">
            {tabs.map((t) => {
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setSearchParams(t.key === 'all' ? {} : { tab: t.key });
                  }}
                  className={`whitespace-nowrap px-3 pb-2 pt-1 transition text-sm font-semibold border-b-2 ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-text-secondary border-transparent hover:text-text-primary hover:border-primary/40'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Invoice</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Due Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-t border-primary/10 hover:bg-primary/5">
                  <td className="px-4 py-4 font-semibold text-text-primary dark:text-text-light">
                    <div>{inv.id}</div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">{inv.source}</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    <div className="font-semibold">{inv.customer}</div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">{inv.email}</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">{inv.items} items</td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">
                    ${inv.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
                    {new Date(inv.due).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="View">
                        <FiEye />
                      </button>
                      <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Download">
                        <FiDownload />
                      </button>
                      <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Edit">
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No invoices match your filters.
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
    info: 'bg-blue-50 border border-blue-100',
    muted: 'bg-slate-50 border border-slate-200',
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
