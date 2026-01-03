import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiEye, FiDownload, FiEdit2, FiTrash2 } from 'react-icons/fi';

const transactionsData = [
  {
    id: '#TX-45821',
    customer: 'Mohamed Artan',
    email: 'mohamed@example.com',
    amount: 1299,
    status: 'Completed',
    date: '2025-11-21',
    method: 'Card',
    channel: 'Web',
    category: 'order',
  },
  {
    id: '#TX-45820',
    customer: 'Amina Warsame',
    email: 'amina@example.com',
    amount: 249,
    status: 'Pending',
    date: '2025-11-20',
    method: 'Mobile Money',
    channel: 'App',
    category: 'product',
  },
  {
    id: '#TX-45819',
    customer: 'Rahim Nur',
    email: 'rahim@example.com',
    amount: 559,
    status: 'Refunded',
    date: '2025-11-19',
    method: 'Card',
    channel: 'Web',
    category: 'refund',
  },
  {
    id: '#TX-45818',
    customer: 'Lina Ahmed',
    email: 'lina@example.com',
    amount: 89,
    status: 'Failed',
    date: '2025-11-18',
    method: 'POS',
    channel: 'POS',
    category: 'customer',
  },
  {
    id: '#TX-45817',
    customer: 'Carlos Pinto',
    email: 'carlos@example.com',
    amount: 729,
    status: 'Completed',
    date: '2025-11-17',
    method: 'Card',
    channel: 'Storefront',
    category: 'product',
  },
];

const productsData = [
  {
    id: 'PRC-HRX6OYAN',
    name: 'Pulse Mini Speaker',
    price: 39,
    oldPrice: 49,
    stock: 200,
    category: 'Audio',
    ads: 'No ads',
    status: 'Published',
  },
  {
    id: 'PRC-JHCRZN3E',
    name: 'ZenNote 15',
    price: 899,
    oldPrice: 950,
    stock: 22,
    category: 'Laptops',
    ads: 'No ads',
    status: 'Published',
  },
  {
    id: 'PRC-T4OPYX4X',
    name: 'Aurora Buds X',
    price: 129,
    oldPrice: 149,
    stock: 120,
    category: 'Audio',
    ads: 'Featured',
    status: 'Published',
  },
  {
    id: 'PRC-L6J7O3UH',
    name: 'Galaxy One Pro',
    price: 899,
    oldPrice: 999,
    stock: 50,
    category: 'Phones',
    ads: 'Exclusive',
    status: 'Published',
  },
  {
    id: 'PRC-WTFY9A6Y',
    name: 'NovaBook Air 14',
    price: 749,
    oldPrice: 799,
    stock: 35,
    category: 'Laptops',
    ads: 'Featured',
    status: 'Published',
  },
];

const ordersData = [
  {
    id: '#ORD-7841',
    customer: 'Mohamed Artan',
    email: 'mohamed@example.com',
    total: 1399,
    items: 4,
    status: 'Completed',
    placedAt: '2025-11-21',
    source: 'Web',
  },
  {
    id: '#ORD-7840',
    customer: 'Amina Warsame',
    email: 'amina@example.com',
    total: 349,
    items: 2,
    status: 'Processing',
    placedAt: '2025-11-20',
    source: 'App',
  },
  {
    id: '#ORD-7839',
    customer: 'Lina Ahmed',
    email: 'lina@example.com',
    total: 89,
    items: 1,
    status: 'Cancelled',
    placedAt: '2025-11-19',
    source: 'POS',
  },
  {
    id: '#ORD-7838',
    customer: 'Rahim Nur',
    email: 'rahim@example.com',
    total: 559,
    items: 3,
    status: 'Refunded',
    placedAt: '2025-11-18',
    source: 'Web',
  },
];

const customersData = [
  {
    id: '#CUS-204',
    name: 'Mohamed Artan',
    email: 'mohamed@example.com',
    joined: '2025-11-12',
    totalOrders: 12,
    lifetimeValue: 8240,
    status: 'Active',
  },
  {
    id: '#CUS-203',
    name: 'Amina Warsame',
    email: 'amina@example.com',
    joined: '2025-11-10',
    totalOrders: 5,
    lifetimeValue: 1890,
    status: 'Active',
  },
  {
    id: '#CUS-202',
    name: 'Rahim Nur',
    email: 'rahim@example.com',
    joined: '2025-11-05',
    totalOrders: 2,
    lifetimeValue: 689,
    status: 'Churn Risk',
  },
  {
    id: '#CUS-201',
    name: 'Lina Ahmed',
    email: 'lina@example.com',
    joined: '2025-11-02',
    totalOrders: 3,
    lifetimeValue: 320,
    status: 'Inactive',
  },
];

const statusTone = (status) => {
  switch (status) {
    case 'Completed':
    case 'Published':
    case 'Active':
      return 'bg-emerald-100 text-emerald-700';
    case 'Pending':
    case 'Processing':
      return 'bg-blue-100 text-blue-700';
    case 'Refunded':
      return 'bg-amber-100 text-amber-700';
    case 'Failed':
    case 'Cancelled':
    case 'Inactive':
      return 'bg-rose-100 text-rose-700';
    case 'Churn Risk':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const adsTone = (ads) => {
  switch (ads) {
    case 'Featured':
      return 'text-emerald-700 border border-emerald-300 bg-emerald-50';
    case 'Exclusive':
      return 'text-blue-700 border border-blue-300 bg-blue-50';
    default:
      return 'text-rose-700 border border-rose-300 bg-rose-50';
  }
};

const tabs = [
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'refunds', label: 'Refunds' },
  { key: 'cancelled', label: 'Cancelled Orders' },
];

export default function Transactions() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = tabs.find((t) => t.key === searchParams.get('tab'))?.key || tabs[0].key;
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setStatus('all');
    setQuery('');
    setDateRange('all');
  }, [tab]);

  const matchesDateRange = (dateString, rangeKey) => {
    if (rangeKey === 'all' || !dateString) return true;
    const date = new Date(dateString);
    const now = new Date();
    const ranges = {
      last7: 7,
      last30: 30,
      last90: 90,
      last365: 365,
    };
    const days = ranges[rangeKey];
    if (!days) return true;
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  };

  const filteredData = useMemo(() => {
    const q = query.toLowerCase();

    if (tab === 'products') {
      return productsData.filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        const matchesStatus = status === 'all' ? true : p.status.toLowerCase() === status;
        return matchesQuery && matchesStatus;
      });
    }

    if (tab === 'orders') {
      return ordersData.filter((o) => {
        const matchesQuery =
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.source.toLowerCase().includes(q);
        const matchesStatus = status === 'all' ? true : o.status.toLowerCase() === status;
        const matchesDate = matchesDateRange(o.placedAt, dateRange);
        return matchesQuery && matchesStatus && matchesDate;
      });
    }

    if (tab === 'cancelled') {
      return ordersData.filter((o) => {
        const matchesQuery =
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.source.toLowerCase().includes(q);
        const isCancelled = o.status.toLowerCase() === 'cancelled';
        const matchesStatus = status === 'all' ? true : o.status.toLowerCase() === status;
        const matchesDate = matchesDateRange(o.placedAt, dateRange);
        return isCancelled && matchesQuery && matchesStatus && matchesDate;
      });
    }

    if (tab === 'customers') {
      return customersData.filter((c) => {
        const matchesQuery =
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
        const matchesStatus = status === 'all' ? true : c.status.toLowerCase() === status;
        const matchesDate = matchesDateRange(c.joined, dateRange);
        return matchesQuery && matchesStatus && matchesDate;
      });
    }

    // all / refunds fall back to transactions
    return transactionsData.filter((tx) => {
      const matchesTab = tab === 'refunds' ? tx.status === 'Refunded' || tx.category === 'refund' : true;
      const matchesQuery =
        tx.id.toLowerCase().includes(q) ||
        tx.customer.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.channel.toLowerCase().includes(q);
      const matchesStatus = status === 'all' ? true : tx.status.toLowerCase() === status;
      const matchesDate = matchesDateRange(tx.date, dateRange);
      return matchesTab && matchesQuery && matchesStatus && matchesDate;
    });
  }, [query, status, tab, dateRange]);

  const stats = useMemo(() => {
    const completed = transactionsData.filter((t) => t.status === 'Completed').length;
    const pending = transactionsData.filter((t) => t.status === 'Pending').length;
    const refunded = transactionsData.filter((t) => t.status === 'Refunded').length;
    const failed = transactionsData.filter((t) => t.status === 'Failed').length;
    const volume = transactionsData.reduce((sum, t) => sum + t.amount, 0);
    return { completed, pending, refunded, failed, volume };
  }, []);

  const statusOptions = useMemo(() => {
    if (tab === 'products') {
      return ['all', 'published'];
    }
    if (tab === 'orders' || tab === 'cancelled') {
      return ['all', 'completed', 'processing', 'refunded', 'cancelled'];
    }
    if (tab === 'customers') {
      return ['all', 'active', 'churn risk', 'inactive'];
    }
    return ['all', 'completed', 'pending', 'refunded', 'failed'];
  }, [tab]);

  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
        <FiSearch className="text-text-secondary" />
        <input
          type="text"
          placeholder="Search by name, ID, or customer..."
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
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'all' ? 'All status' : opt[0].toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
        >
          <option value="all">All time</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
          <option value="last90">Last 90 days</option>
          <option value="last365">Last 12 months</option>
        </select>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="pb-1 -mx-4">
      <div className="flex items-center gap-2 overflow-x-auto bg-[#f5f8fb] px-2 py-2 w-full">
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSearchParams({ tab: t.key });
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
  );

  const renderProducts = () => (
    <table className="min-w-full text-sm">
      <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Product</th>
          <th className="text-left px-4 py-3">Price</th>
          <th className="text-left px-4 py-3">Stock</th>
          <th className="text-left px-4 py-3">Category</th>
          <th className="text-left px-4 py-3">Ads</th>
          <th className="text-left px-4 py-3">Status</th>
          <th className="text-right px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((p) => (
          <tr key={p.id} className="border-t border-primary/10 hover:bg-primary/5">
            <td className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-semibold">
                  IMG
                </div>
                <div>
                  <div className="font-semibold text-text-primary dark:text-text-light">{p.name}</div>
                  <div className="text-xs text-text-secondary dark:text-text-light/70">{p.id}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 font-semibold text-text-primary dark:text-text-light">
              ${p.price.toLocaleString()}
              <span className="ml-2 line-through text-text-secondary dark:text-text-light/60 text-xs">
                ${p.oldPrice.toLocaleString()}
              </span>
            </td>
            <td className="px-4 py-4">
              <div className="text-emerald-600 font-semibold">Available</div>
              <div className="text-xs text-text-secondary dark:text-text-light/70">{p.stock} Stock</div>
            </td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light">{p.category}</td>
            <td className="px-4 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${adsTone(p.ads)}`}>{p.ads}</span>
            </td>
            <td className="px-4 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(p.status)}`}>{p.status}</span>
            </td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Edit">
                  <FiEdit2 />
                </button>
                <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filteredData.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
              No products match your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderOrders = () => (
    <table className="min-w-full text-sm">
      <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Order</th>
          <th className="text-left px-4 py-3">Customer</th>
          <th className="text-left px-4 py-3">Items</th>
          <th className="text-left px-4 py-3">Total</th>
          <th className="text-left px-4 py-3">Status</th>
          <th className="text-left px-4 py-3">Placed</th>
          <th className="text-right px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((o) => (
          <tr key={o.id} className="border-t border-primary/10 hover:bg-primary/5">
            <td className="px-4 py-4 font-semibold text-text-primary dark:text-text-light">
              <div>{o.id}</div>
              <div className="text-xs text-text-secondary dark:text-text-light/70">{o.source}</div>
            </td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light">
              <div className="font-semibold">{o.customer}</div>
              <div className="text-xs text-text-secondary dark:text-text-light/70">{o.email}</div>
            </td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light">{o.items} items</td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">
              ${o.total.toLocaleString()}
            </td>
            <td className="px-4 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(o.status)}`}>{o.status}</span>
            </td>
            <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
              {new Date(o.placedAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="View">
                  <FiEye />
                </button>
                <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Download invoice">
                  <FiDownload />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filteredData.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
              No orders match your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderCustomers = () => (
    <table className="min-w-full text-sm">
      <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Customer</th>
          <th className="text-left px-4 py-3">Customer ID</th>
          <th className="text-left px-4 py-3">Joined</th>
          <th className="text-left px-4 py-3">Orders</th>
          <th className="text-left px-4 py-3">LTV</th>
          <th className="text-left px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((c) => (
          <tr key={c.id} className="border-t border-primary/10 hover:bg-primary/5">
            <td className="px-4 py-4 text-text-primary dark:text-text-light">
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-text-secondary dark:text-text-light/70">{c.email}</div>
            </td>
            <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">{c.id}</td>
            <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
              {new Date(c.joined).toLocaleDateString()}
            </td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light">{c.totalOrders}</td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">
              ${c.lifetimeValue.toLocaleString()}
            </td>
            <td className="px-4 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(c.status)}`}>{c.status}</span>
            </td>
          </tr>
        ))}
        {filteredData.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
              No customers match your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderTransactions = () => (
    <table className="min-w-full text-sm">
      <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Transaction</th>
          <th className="text-left px-4 py-3">Customer</th>
          <th className="text-left px-4 py-3">Method</th>
          <th className="text-left px-4 py-3">Amount</th>
          <th className="text-left px-4 py-3">Category</th>
          <th className="text-left px-4 py-3">Status</th>
          <th className="text-left px-4 py-3">Date</th>
          <th className="text-right px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((tx) => (
          <tr key={tx.id} className="border-t border-primary/10 hover:bg-primary/5">
            <td className="px-4 py-4 font-semibold text-text-primary dark:text-text-light">
              <div>{tx.id}</div>
              <div className="text-xs text-text-secondary dark:text-text-light/70">{tx.channel}</div>
            </td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light">
              <div className="font-semibold">{tx.customer}</div>
              <div className="text-xs text-text-secondary dark:text-text-light/70">{tx.email}</div>
            </td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light">{tx.method}</td>
            <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">
              ${tx.amount.toLocaleString()}
            </td>
            <td className="px-4 py-4 text-text-secondary dark:text-text-light/70 capitalize">
              {tx.category || '—'}
            </td>
            <td className="px-4 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(tx.status)}`}>
                {tx.status}
              </span>
            </td>
            <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
              {new Date(tx.date).toLocaleDateString()}
            </td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button
                  className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition"
                  title="View"
                >
                  <FiEye />
                </button>
                <button
                  className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition"
                  title="Download receipt"
                >
                  <FiDownload />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filteredData.length === 0 && (
          <tr>
            <td colSpan={8} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
              No transactions match your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderTable = () => {
    if (tab === 'products') return renderProducts();
    if (tab === 'orders' || tab === 'cancelled') return renderOrders();
    if (tab === 'customers') return renderCustomers();
    return renderTransactions();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Completed" value={stats.completed} tone="success" />
        <StatCard title="Pending" value={stats.pending} tone="info" />
        <StatCard title="Refunded" value={stats.refunded} tone="warning" />
        <StatCard title="Failed" value={stats.failed} tone="danger" />
        <StatCard title="Total Volume" value={`$${stats.volume.toLocaleString()}`} tone="default" strong />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <div className="p-4 border-b border-primary/10 flex flex-col gap-3">
          {renderFilters()}
          {renderTabs()}
        </div>

        <div className="overflow-x-auto">{renderTable()}</div>
      </div>
    </div>
  );
}

function StatCard({ title, value, tone = 'default', strong }) {
  const toneMap = {
    default: 'bg-light-card dark:bg-dark-card border border-primary/10',
    success: 'bg-emerald-50 border border-emerald-100',
    info: 'bg-blue-50 border border-blue-100',
    warning: 'bg-amber-50 border border-amber-100',
    danger: 'bg-rose-50 border border-rose-100',
  };
  return (
    <div className={`rounded-2xl p-4 shadow-soft ${toneMap[tone] || toneMap.default}`}>
      <p className="text-sm font-semibold text-text-secondary dark:text-text-light/70 uppercase tracking-wide">{title}</p>
      <div
        className={`text-3xl font-extrabold mt-2 ${
          strong ? 'text-text-primary' : 'text-text-primary dark:text-text-light'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
