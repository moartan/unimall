import { useMemo, useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiFileText } from 'react-icons/fi';

const mockOrders = [
  {
    id: '#INV-9043',
    customer: 'Amina Warsame',
    total: 299,
    status: 'Paid',
    fulfillment: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    items: 3,
    date: '2024-03-14',
    channel: 'Storefront',
  },
  {
    id: '#INV-9042',
    customer: 'Jamal Yusuf',
    total: 1249,
    status: 'Shipped',
    fulfillment: 'In transit',
    paymentMethod: 'Card',
    items: 5,
    date: '2024-03-13',
    channel: 'Marketplace',
  },
  {
    id: '#INV-9041',
    customer: 'Lina Ahmed',
    total: 86,
    status: 'Pending',
    fulfillment: 'Awaiting',
    paymentMethod: 'Card',
    items: 1,
    date: '2024-03-13',
    channel: 'Storefront',
  },
  {
    id: '#INV-9040',
    customer: 'Carlos Pinto',
    total: 449,
    status: 'Paid',
    fulfillment: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    items: 2,
    date: '2024-03-12',
    channel: 'Social',
  },
  {
    id: '#INV-9039',
    customer: 'Muna Abdi',
    total: 189,
    status: 'Cancelled',
    fulfillment: 'Cancelled',
    paymentMethod: 'Card',
    items: 2,
    date: '2024-03-12',
    channel: 'Storefront',
  },
  {
    id: '#INV-9038',
    customer: 'Rahim Nur',
    total: 729,
    status: 'Shipped',
    fulfillment: 'In transit',
    paymentMethod: 'Card',
    items: 4,
    date: '2024-03-11',
    channel: 'POS',
  },
];

const statusBadge = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-700';
    case 'Shipped':
      return 'bg-blue-100 text-blue-700';
    case 'Pending':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-rose-100 text-rose-700';
  }
};

export default function Orders() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [channel, setChannel] = useState('all');
  const [payment, setPayment] = useState('all');

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      const q = query.toLowerCase();
      const matchesQuery = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      const matchesStatus = status === 'all' ? true : o.status.toLowerCase() === status;
      const matchesChannel = channel === 'all' ? true : o.channel.toLowerCase() === channel;
      const matchesPayment =
        payment === 'all' ? true : o.paymentMethod.toLowerCase().includes(payment);
      return matchesQuery && matchesStatus && matchesChannel && matchesPayment;
    });
  }, [query, status, channel, payment]);

  const stats = useMemo(() => {
    const total = mockOrders.length;
    const awaiting = mockOrders.filter((o) => o.status === 'Pending').length;
    const delivered = mockOrders.filter((o) => o.fulfillment?.toLowerCase().includes('delivered')).length;
    const revenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
    return { total, awaiting, delivered, revenue };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value={stats.total} tone="default" />
        <StatCard title="Awaiting Payment" value={stats.awaiting} tone="warning" />
        <StatCard title="Delivered" value={stats.delivered} tone="success" />
        <StatCard title="Gross Revenue" value={`$${stats.revenue.toLocaleString()}`} tone="default" strong />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-primary/10">
          <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
            <FiSearch className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search by order code, customer, or phone..."
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
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            <option value="all">All payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="delivery">Delivery</option>
          </select>

          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            <option value="all">All sources</option>
            <option value="storefront">Storefront</option>
            <option value="marketplace">Marketplace</option>
            <option value="social">Social</option>
            <option value="pos">POS</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Fulfillment</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-primary/10">
                  <td className="px-4 py-4 font-semibold text-text-primary dark:text-text-light">
                    <div>{order.id}</div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    <div className="font-semibold">{order.customer}</div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">customer@example.com</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    <div className="font-semibold">{order.items} items</div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">{order.channel}</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <div className="text-xs text-text-secondary dark:text-text-light/70 mt-1">{order.paymentMethod}</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {order.fulfillment}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="View">
                        <FiEye />
                      </button>
                      <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Invoice">
                        <FiFileText />
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
                  <td colSpan={8} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No orders match your filters.
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
    warning: 'bg-amber-50 border border-amber-100',
    success: 'bg-emerald-50 border border-emerald-100',
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
