import { FiX } from 'react-icons/fi';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '—');
const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;
const paymentTone = (status) => {
  const v = (status || '').toLowerCase();
  if (v === 'paid') return 'bg-emerald-100 text-emerald-700';
  if (v === 'pending') return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

export default function OrderQuickView({ order, onClose }) {
  const firstItem = order?.itemDetails?.[0];
  const image = firstItem?.image;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 text-xl"
          aria-label="Close"
        >
          <FiX />
        </button>

        <div className="grid md:grid-cols-[1fr,1.2fr] gap-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 min-h-[300px] flex items-center justify-center overflow-hidden">
            {image ? (
              <img src={image} alt={firstItem?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400">No image</div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 uppercase">
              {firstItem?.name || 'Order items'}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentTone(order.paymentStatus)}`}>
                {order.paymentStatus || '—'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {order.fulfillmentStatus || '—'}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">{order.orderCode}</h3>
              <p className="text-sm text-slate-600">Customer: {order.customer} · {order.customerEmail}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoTile label="Total" value={formatMoney(order.total)} />
              <InfoTile label="Items" value={order.items} />
              <InfoTile label="Payment" value={order.paymentMethod || '—'} />
              <InfoTile label="Order Date" value={formatDateTime(order.createdAt)} />
              <InfoTile label="Last Update" value={formatDateTime(order.updatedAt)} />
              <InfoTile label="Delivered Date" value={formatDateTime(order.deliveredAt)} />
            </div>

            <div className="border border-slate-200 rounded-2xl p-3">
              <p className="text-sm font-semibold text-slate-700 mb-2">Items</p>
              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                {(order.itemDetails || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500">Qty {item.quantity} × {formatMoney(item.price)}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
                {!order.itemDetails?.length && (
                  <div className="text-sm text-slate-500">No item details</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase font-semibold text-slate-500 mb-1">{label}</p>
      <p className="text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
