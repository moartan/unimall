import {
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownRight,
  FiClock,
  FiMoreHorizontal,
  FiPackage,
} from 'react-icons/fi';

const kpis = [
  {
    title: 'Revenue',
    value: '$124,900',
    delta: '+8.4% vs last week',
    positive: true,
    icon: <FiDollarSign />,
  },
  {
    title: 'Orders',
    value: '3,428',
    delta: '+4.1% vs last week',
    positive: true,
    icon: <FiShoppingBag />,
  },
  {
    title: 'Customers',
    value: '1,276',
    delta: '-1.3% new users',
    positive: false,
    icon: <FiUsers />,
  },
  {
    title: 'Conversion',
    value: '3.92%',
    delta: '+0.6 pts',
    positive: true,
    icon: <FiTrendingUp />,
  },
];

const topProducts = [
  { name: 'Sony A6700 Creator Kit', category: 'Camera', sales: '$18,230', units: 142 },
  { name: 'Galaxy Tab S10 Ultra', category: 'Tablet', sales: '$14,980', units: 128 },
  { name: 'Beats Studio Pro', category: 'Audio', sales: '$12,410', units: 203 },
  { name: 'Bose QC Ultra', category: 'Audio', sales: '$10,440', units: 167 },
];

const recentOrders = [
  { id: '#INV-9043', customer: 'Amina Warsame', total: '$299', status: 'Paid', time: '12m ago' },
  { id: '#INV-9042', customer: 'Jamal Yusuf', total: '$1,249', status: 'Shipped', time: '32m ago' },
  { id: '#INV-9041', customer: 'Lina Ahmed', total: '$86', status: 'Pending', time: '1h ago' },
  { id: '#INV-9040', customer: 'Carlos Pinto', total: '$449', status: 'Paid', time: '1h 20m ago' },
];

const fulfillment = [
  { label: 'On time shipments', value: 92 },
  { label: 'Return rate', value: 3.8 },
  { label: 'Support SLA', value: 96 },
];

const channels = [
  { label: 'Storefront', value: 52 },
  { label: 'Marketplace', value: 28 },
  { label: 'Social', value: 14 },
  { label: 'POS', value: 6 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary dark:text-text-light/70">Welcome back, System Admin</p>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-text-light">E-commerce Overview</h1>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-soft hover:bg-primary-hover transition">
          <FiPackage /> Create Shipment
        </button>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="rounded-xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary dark:text-text-light/70">{kpi.title}</span>
              <span className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg">
                {kpi.icon}
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary dark:text-text-light">{kpi.value}</div>
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                kpi.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {kpi.positive ? <FiArrowUpRight /> : <FiArrowDownRight />}
              {kpi.delta}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Revenue</h3>
              <p className="text-sm text-text-secondary dark:text-text-light/70">Last 7 days</p>
            </div>
            <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition">
              <FiMoreHorizontal />
            </button>
          </div>
          <div className="h-52 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 px-4 py-3">
              {/* simple spark bars to avoid chart deps */}
              <div className="flex items-end gap-2 h-full">
                {[38, 48, 42, 57, 63, 58, 76].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-full bg-primary/40"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-text-secondary dark:text-text-light/70">
            <div>
              <div className="text-xs uppercase tracking-wide">Avg order</div>
              <div className="font-semibold text-text-primary dark:text-text-light">$142.30</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide">Refunds</div>
              <div className="font-semibold text-text-primary dark:text-text-light">$1,240</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide">Net margin</div>
              <div className="font-semibold text-text-primary dark:text-text-light">38.6%</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Sales by channel</h3>
              <p className="text-sm text-text-secondary dark:text-text-light/70">Last 30 days</p>
            </div>
            <FiMoreHorizontal className="text-text-secondary" />
          </div>
          <div className="space-y-3">
            {channels.map((ch) => (
              <div key={ch.label} className="flex items-center gap-3">
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm text-text-primary dark:text-text-light">
                    <span>{ch.label}</span>
                    <span>{ch.value}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-light-bg dark:bg-dark-hover overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${ch.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Top products</h3>
            <FiMoreHorizontal className="text-text-secondary" />
          </div>
          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between border border-primary/10 rounded-lg px-3 py-2">
                <div>
                  <div className="font-semibold text-text-primary dark:text-text-light">{p.name}</div>
                  <div className="text-xs text-text-secondary dark:text-text-light/70">{p.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary dark:text-text-light">{p.sales}</div>
                  <div className="text-xs text-text-secondary dark:text-text-light/70">{p.units} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Recent orders</h3>
            <FiMoreHorizontal className="text-text-secondary" />
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border border-primary/10 rounded-lg px-3 py-2">
                <div>
                  <div className="font-semibold text-text-primary dark:text-text-light">{order.id}</div>
                  <div className="text-xs text-text-secondary dark:text-text-light/70">{order.customer}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary dark:text-text-light">{order.total}</div>
                  <div className="flex items-center justify-end gap-1 text-xs text-text-secondary dark:text-text-light/70">
                    <FiClock /> {order.time}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Fulfillment health</h3>
            <FiMoreHorizontal className="text-text-secondary" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {fulfillment.map((item) => (
              <div key={item.label} className="border border-primary/10 rounded-lg px-3 py-2 space-y-1">
                <div className="text-sm font-semibold text-text-primary dark:text-text-light">{item.label}</div>
                <div className="text-2xl font-bold text-text-primary dark:text-text-light">{item.value}%</div>
                <div className="h-2 rounded-full bg-light-bg dark:bg-dark-hover overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full"
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Low stock alerts</h3>
            <FiMoreHorizontal className="text-text-secondary" />
          </div>
          <div className="space-y-3 text-sm">
            {[
              { name: 'Pixel Buds Pro', stock: 6 },
              { name: 'Logi MX Master 4', stock: 9 },
              { name: 'Kindle Paperwhite', stock: 11 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between border border-primary/10 rounded-lg px-3 py-2">
                <div>
                  <div className="font-semibold text-text-primary dark:text-text-light">{item.name}</div>
                  <div className="text-xs text-text-secondary dark:text-text-light/70">SKU-{item.stock}LVL</div>
                </div>
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
