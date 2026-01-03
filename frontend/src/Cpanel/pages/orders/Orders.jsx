import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCpanel } from '../../context/CpanelProvider';
import { getOrders } from '../../api/catalog';
import OrderFilters from './components/OrderFilters';
import OrderTabsBar from './components/OrderTabsBar';
import OrderRow from './components/OrderRow';
import { orderTabs, deriveStage } from './components/tabs';
import { buildOrdersKey, getOrdersCache, setOrdersCache } from './components/cache';
import LoadingSkeletonRows from './components/LoadingSkeletonRows';
import OrderQuickView from './components/OrderQuickView';

const statusBadge = (status) => {
  const value = (status || '').toLowerCase();
  switch (value) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700';
    case 'shipped':
      return 'bg-blue-100 text-blue-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'refunded':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-rose-100 text-rose-700';
  }
};

export default function Orders() {
  const { api } = useCpanel();
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');
  const [payment, setPayment] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialParam = searchParams.get('tab') || 'all';
  const initialTab = orderTabs.find((t) => t.key === initialParam)?.key || 'all';
  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 500 };
        const cacheKey = buildOrdersKey(params);
        const cached = getOrdersCache(cacheKey);
        if (cached) {
          setOrders(cached);
        }

        const { data } = await getOrders(api, params);
        const list = (data?.orders || []).map((o) => ({
          id: o._id,
          orderCode: o.orderCode,
          customer: o.user?.name || '—',
          customerEmail: o.user?.email || '—',
          total: o.grandTotal ?? o.subtotal ?? 0,
          paymentStatus: o.paymentStatus || 'pending',
          fulfillmentStatus: o.fulfillmentStatus || 'pending',
          paymentMethod: o.transactionId || 'Online',
          items: o.items?.length || 0,
          itemDetails: o.items || [],
          channel: 'Online',
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          deliveredAt: o.deliveredAt,
          deliveredBy: o.fulfilledBy?.name || o.updatedBy?.name || o.updatedBy || '—',
          invoiceId: o.invoiceId || o.invoiceCode || null,
        }));
        setOrders(list);
        setOrdersCache(cacheKey, list);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [api]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = query.toLowerCase();
      const matchesQuery =
        o.orderCode?.toLowerCase().includes(q) ||
        o.customer?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q);
      const stage = deriveStage(o);
      const matchesTab = tab === 'all' ? true : stage === tab;
      const matchesChannel = channel === 'all' ? true : (o.channel || '').toLowerCase() === channel;
      const matchesPayment =
        payment === 'all'
          ? true
          : (o.paymentMethod || '').toLowerCase().includes(payment) ||
            (o.paymentStatus || '').toLowerCase().includes(payment);
      return matchesQuery && matchesTab && matchesChannel && matchesPayment;
    });
  }, [orders, query, tab, channel, payment]);

  const stats = useMemo(() => {
    const total = orders.length;
    const awaiting = orders.filter((o) => deriveStage(o) === 'awaiting-payment').length;
    const delivered = orders.filter((o) => deriveStage(o) === 'delivered').length;
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, awaiting, delivered, revenue };
  }, [orders]);

  const resetFilters = () => {
    setQuery('');
    setPayment('all');
    setChannel('all');
    setTab('all');
    const next = new URLSearchParams(searchParams);
    next.delete('tab');
    setSearchParams(next);
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    const next = new URLSearchParams(searchParams);
    if (nextTab === 'all') next.delete('tab');
    else next.set('tab', nextTab);
    setSearchParams(next);
  };

  const isDeliveredView = tab === 'delivered';
  const showInvoiceColumn = tab === 'delivered' || tab === 'return-refund';

  const columnsCount = (() => {
    if (isDeliveredView) return showInvoiceColumn ? 9 : 8;
    if (tab === 'awaiting-fulfillment' || tab === 'shipped-transit') return 7;
    if (tab === 'return-refund') return showInvoiceColumn ? 9 : 8;
    return 8;
  })();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value={stats.total} tone="default" />
        <StatCard title="Awaiting Payment" value={stats.awaiting} tone="warning" />
        <StatCard title="Delivered" value={stats.delivered} tone="success" />
        <StatCard title="Gross Revenue" value={`$${stats.revenue.toLocaleString()}`} tone="default" strong />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <OrderFilters
          query={query}
          onQueryChange={setQuery}
          payment={payment}
          onPaymentChange={setPayment}
          channel={channel}
          onChannelChange={setChannel}
          onReset={resetFilters}
        />

        <div className="pb-3">
          <OrderTabsBar tabs={orderTabs} active={tab} onChange={handleTabChange} />
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
                {isDeliveredView ? (
                  <>
                    <th className="text-left px-4 py-3">Order Date</th>
                    <th className="text-left px-4 py-3">Delivered Date</th>
                    {showInvoiceColumn ? <th className="text-left px-4 py-3">Invoice</th> : null}
                    <th className="text-left px-4 py-3">Delivered By</th>
                  </>
                ) : tab === 'awaiting-fulfillment' ? (
                  <>
                    <th className="text-left px-4 py-3">Order Date</th>
                    <th className="text-left px-4 py-3">Last Update</th>
                  </>
                ) : tab === 'shipped-transit' ? (
                  <>
                    <th className="text-left px-4 py-3">Order Date</th>
                    <th className="text-left px-4 py-3">Last Update</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-4 py-3">Fulfillment</th>
                    <th className="text-left px-4 py-3">Updated</th>
                    {showInvoiceColumn ? <th className="text-left px-4 py-3">Invoice</th> : null}
                    <th className="text-right px-4 py-3">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingSkeletonRows rows={6} />
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    idx={idx}
                    statusBadge={statusBadge}
                    isDeliveredView={isDeliveredView}
                    tab={tab}
                    showInvoiceColumn={showInvoiceColumn}
                    onView={() => setSelected(order)}
                  />
                ))
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={columnsCount} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selected ? (
        <OrderQuickView order={selected} onClose={() => setSelected(null)} />
      ) : null}
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
