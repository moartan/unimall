import { useMemo, useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const typeTitle = {
  positive: 'Invoice Generator — Completed Order',
  negative: 'Invoice Generator — Return / Cancellation',
};

const statusTone = (status) => {
  const v = (status || '').toLowerCase();
  if (v === 'paid') return 'bg-emerald-100 text-emerald-700';
  if (v === 'sent') return 'bg-blue-100 text-blue-700';
  if (v === 'overdue') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
};

const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

export default function InvoiceGenerator() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') === 'negative' ? 'negative' : 'positive';
  const orderCode = searchParams.get('order') || '';
  const incomingOrder = location.state?.order;

  const [form, setForm] = useState(() => ({
    invoiceCode: `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customer: incomingOrder?.customer || 'Customer Name',
    email: incomingOrder?.customerEmail || 'customer@example.com',
    phone: incomingOrder?.customerPhone || '',
    company: '',
    address: '',
    status: type === 'negative' ? 'Overdue' : 'Paid',
    orderCode: incomingOrder?.orderCode || orderCode,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: '',
  }));

  const [items, setItems] = useState(() =>
    incomingOrder?.itemDetails?.length
      ? incomingOrder.itemDetails.map((it) => ({
          name: it.name || 'Item',
          qty: it.quantity || 1,
          price: it.price || 0,
        }))
      : [
          { name: 'Sample Product', qty: 1, price: 99 },
          { name: 'Second Item', qty: 2, price: 49 },
        ],
  );

  useEffect(() => {
    if (incomingOrder) {
        setForm((prev) => ({
          ...prev,
          customer: incomingOrder.customer || prev.customer,
          email: incomingOrder.customerEmail || prev.email,
          phone: incomingOrder.customerPhone || prev.phone,
          orderCode: incomingOrder.orderCode || prev.orderCode,
        }));
      if (incomingOrder.itemDetails?.length) {
        setItems(
          incomingOrder.itemDetails.map((it) => ({
            name: it.name || 'Item',
            qty: it.quantity || 1,
            price: it.price || 0,
          })),
        );
      }
    }
  }, [incomingOrder]);

  const [extras, setExtras] = useState([
    { label: 'Tax', amount: 5 },
    { label: 'Delivery', amount: 0 },
  ]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
    const extrasTotal = extras.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const total = subtotal + extrasTotal;
    return { subtotal, extrasTotal, total };
  }, [items, extras]);

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { name: 'New Item', qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">
          {typeTitle[type]}
        </h1>
        <p className="text-text-secondary dark:text-text-light/70">
          {type === 'negative'
            ? 'Generate a credit/return invoice linked to a cancelled or returned order.'
            : 'Generate a standard invoice for a completed order.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <div className="space-y-4">
          <Section title="Invoice Details">
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                label="Invoice Code"
                value={form.invoiceCode}
                onChange={(e) => setForm({ ...form, invoiceCode: e.target.value })}
              />
              <Input
                label="Order Code"
                value={form.orderCode}
                onChange={(e) => setForm({ ...form, orderCode: e.target.value })}
              />
              <Input
                label="Issue Date"
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
              <Input
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Sent', label: 'Sent' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Overdue', label: 'Overdue' },
                ]}
              />
            </div>
          </Section>

          <Section title="Customer">
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                label="Customer Name"
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
              />
              <Input
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Other (Company / Code / Note)"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <Input
              label="Address / Notes"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Section>

          <Section title="Items">
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <Input
                      label="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      label="Price"
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-sm text-rose-600 hover:underline"
                      disabled={items.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition text-sm"
                >
                  + Add Item
                </button>
              </div>
          </Section>

          <Section title="Other Charges">
            <div className="space-y-3">
              {extras.map((extra, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-7">
                    <Input
                      label="Name"
                      value={extra.label}
                      onChange={(e) =>
                        setExtras((prev) => prev.map((ex, i) => (i === idx ? { ...ex, label: e.target.value } : ex)))
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="Amount"
                      type="number"
                      value={extra.amount}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((ex, i) => (i === idx ? { ...ex, amount: Number(e.target.value) } : ex)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setExtras((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-sm text-rose-600 hover:underline"
                      disabled={extras.length === 0}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setExtras((prev) => [...prev, { label: 'Other', amount: 0 }])}
                className="px-3 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition text-sm"
              >
                + Add Charge
              </button>
            </div>
          </Section>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white shadow-soft p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-primary">{type === 'negative' ? 'Credit Note' : 'Invoice'}</p>
              <h2 className="text-xl font-bold text-text-primary">{form.invoiceCode}</h2>
              <p className="text-sm text-text-secondary">{form.orderCode ? `Order: ${form.orderCode}` : 'No order linked'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(form.status)}`}>
              {form.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm border border-primary/10 rounded-xl p-3 bg-light-bg/60">
            <div>
              <p className="text-xs uppercase font-semibold text-text-secondary">Bill To</p>
              <p className="font-semibold text-text-primary">{form.customer}</p>
              <p className="text-text-secondary">{form.email}</p>
              {form.phone ? <p className="text-text-secondary">{form.phone}</p> : null}
              {form.company ? <p className="text-text-secondary">{form.company}</p> : null}
              {form.address ? <p className="text-text-secondary">{form.address}</p> : null}
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs uppercase font-semibold text-text-secondary">Issue Date</p>
              <p className="font-semibold text-text-primary">{form.issueDate || '—'}</p>
              <p className="text-xs uppercase font-semibold text-text-secondary mt-2">Due Date</p>
              <p className="font-semibold text-text-primary">{form.dueDate || '—'}</p>
            </div>
          </div>

          <div className="border border-primary/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-light-bg text-text-secondary uppercase text-[11px]">
                <tr>
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-right px-3 py-2">Qty</th>
                  <th className="text-right px-3 py-2">Price</th>
                  <th className="text-right px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t border-primary/10">
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2 text-right">{item.qty}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(item.price)}</td>
                    <td className="px-3 py-2 text-right">
                      {formatMoney((Number(item.qty) || 0) * (Number(item.price) || 0))}
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-text-secondary">
                      No items
                    </td>
                  </tr>
                ) : null}
                </tbody>
              </table>
          </div>

          <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
            <span>Subtotal</span>
            <span>{formatMoney(totals.subtotal)}</span>
          </div>
          {extras
            .filter((e) => e.label && Number(e.amount) !== 0)
            .map((e, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm text-text-primary">
                <span>{e.label}</span>
                <span>{formatMoney(e.amount)}</span>
              </div>
            ))}
          <div className="flex items-center justify-between text-lg font-bold text-text-primary">
            <span>Total</span>
            <span>{formatMoney(totals.total)}</span>
          </div>
          <p className="text-xs text-text-secondary">
            {form.notes || 'Notes will appear here. Add terms or return policies as needed.'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-lg border border-primary/20 text-text-secondary hover:bg-primary/10 transition text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition text-sm font-semibold"
        >
          Save &amp; Print
        </button>
        <button
          type="button"
          className="px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow-soft hover:bg-primary-hover transition text-sm"
        >
          Save Invoice
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3 rounded-2xl border border-primary/10 bg-white shadow-soft p-4">
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="text-sm font-semibold text-text-primary flex flex-col gap-1">
      {label}
      <input
        {...props}
        className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light focus:outline-none"
      />
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="text-sm font-semibold text-text-primary flex flex-col gap-1">
      {label}
      <select
        {...props}
        className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
