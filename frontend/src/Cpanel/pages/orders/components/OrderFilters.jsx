import { FiSearch } from 'react-icons/fi';

export default function OrderFilters({
  query,
  onQueryChange,
  payment,
  onPaymentChange,
  channel,
  onChannelChange,
  onReset,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-primary/10">
      <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
        <FiSearch className="text-text-secondary" />
        <input
          type="text"
          placeholder="Search by order code or customer..."
          className="w-full bg-transparent focus:outline-none text-sm text-text-primary dark:text-text-light"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <select
          value={payment}
          onChange={(e) => onPaymentChange(e.target.value)}
          className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
        >
          <option value="all">All payments</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="delivery">Delivery</option>
        </select>

        <select
          value={channel}
          onChange={(e) => onChannelChange(e.target.value)}
          className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
        >
          <option value="all">All sources</option>
          <option value="storefront">Storefront</option>
          <option value="marketplace">Marketplace</option>
          <option value="social">Social</option>
          <option value="pos">POS</option>
        </select>

        <button
          onClick={onReset}
          className="whitespace-nowrap px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
