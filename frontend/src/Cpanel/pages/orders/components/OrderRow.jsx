import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiFileText, FiDownload, FiPlus } from 'react-icons/fi';

const formatDate = (value, withTime = false) => {
  if (!value) return '—';
  const d = new Date(value);
  return withTime ? d.toLocaleString() : d.toLocaleDateString();
};
const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;
const formatPayment = (value) => {
  const v = (value || '').toLowerCase();
  if (v === 'paid') return 'Paid';
  if (v === 'pending') return 'Pending';
  if (v === 'failed' || v === 'hold') return 'Failed';
  if (v === 'refunded') return 'Refunded';
  return value || '—';
};

const fulfillmentTone = (status) => {
  const v = (status || '').toLowerCase();
  if (v === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (v === 'shipped') return 'bg-blue-100 text-blue-700';
  if (v === 'processing') return 'bg-amber-100 text-amber-700';
  if (v === 'returned' || v === 'refund_requested') return 'bg-purple-100 text-purple-700';
  if (v === 'cancelled') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
};

export default function OrderRow({ order, idx, statusBadge, isDeliveredView = false, tab, onView, showInvoiceColumn }) {
  return (
    <tr
      className={`border-t border-primary/10 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f7f9fc]'} hover:bg-light-bg`}
    >
      <td className="px-4 py-4 font-semibold text-text-primary dark:text-text-light">
        <button
          type="button"
          onClick={onView}
          className="text-left text-primary hover:underline"
        >
          {order.orderCode || order.id}
        </button>
        <div className="text-xs text-text-secondary dark:text-text-light/70">
          {formatDate(order.createdAt || order.date)}
        </div>
      </td>
      <td className="px-4 py-4 text-text-primary dark:text-text-light">
        <div className="font-semibold">{order.customer || '—'}</div>
        <div className="text-xs text-text-secondary dark:text-text-light/70">{order.customerEmail || '—'}</div>
      </td>
      <td className="px-4 py-4 text-text-primary dark:text-text-light">
        <div className="font-semibold">{order.items} items</div>
        <div className="text-xs text-text-secondary dark:text-text-light/70">{order.channel || 'Online'}</div>
      </td>
      <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">
        {formatMoney(order.total)}
      </td>
      <td className="px-4 py-4 text-text-primary dark:text-text-light">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(order.paymentStatus)}`}>
          {formatPayment(order.paymentStatus)}
        </span>
        <div className="text-xs text-text-secondary dark:text-text-light/70 mt-1">
          {order.paymentMethod || order.transactionId || '—'}
        </div>
      </td>
      {isDeliveredView ? (
        <>
          <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
            {formatDate(order.createdAt || order.date, true)}
          </td>
          <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
            {formatDate(order.deliveredAt || order.updatedAt || order.date, true)}
          </td>
          {showInvoiceColumn ? (
            <td className="px-4 py-4">
              <InvoiceCell order={order} tab={tab} />
            </td>
          ) : null}
          <td className="px-4 py-4 text-text-primary dark:text-text-light">
            {order.deliveredBy || '—'}
          </td>
        </>
      ) : tab === 'awaiting-fulfillment' || tab === 'shipped-transit' ? (
        <>
          <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
            {formatDate(order.createdAt || order.date, true)}
          </td>
          <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
            {formatDate(order.updatedAt || order.date, true)}
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-4 text-text-primary dark:text-text-light">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fulfillmentTone(order.fulfillmentStatus || order.fulfillment)}`}>
              {(order.fulfillmentStatus || order.fulfillment || '—').toLowerCase()}
            </span>
          </td>
          <td className="px-4 py-4 text-text-secondary dark:text-text-light/70">
            {formatDate(order.updatedAt || order.date)}
          </td>
          {showInvoiceColumn ? (
            <td className="px-4 py-4">
              <InvoiceCell order={order} tab={tab} />
            </td>
          ) : null}
          <td className="px-4 py-4 text-right">
            <div className="flex justify-end gap-2">
              <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Invoice">
                <FiFileText />
              </button>
              <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition" title="Edit">
                <FiEdit2 />
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  );
}

function InvoiceCell({ order, tab }) {
  const hasInvoice = Boolean(order.invoiceId);
  const label = hasInvoice ? 'Download' : 'Create';
  const tone = hasInvoice
    ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
    : 'border-sky-200 text-sky-700 bg-sky-50';
  const Icon = hasInvoice ? FiDownload : FiPlus;
  const invoiceType = tab === 'return-refund' ? 'negative' : 'positive';
  if (hasInvoice) {
    return (
      <a
        href={`/cpanel/invoices/${order.invoiceId}?download=1`}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${tone}`}
        onClick={(e) => e.stopPropagation()}
        title="Download invoice"
      >
        <Icon className="text-sm" />
        {label}
      </a>
    );
  }

  return (
    <Link
      to={`/cpanel/invoices/generate?type=${invoiceType}&order=${order.orderCode || order.id}`}
      state={{ order }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${tone}`}
      onClick={(e) => e.stopPropagation()}
      title="Create invoice"
    >
      <Icon className="text-sm" />
      {label}
    </Link>
  );
}
