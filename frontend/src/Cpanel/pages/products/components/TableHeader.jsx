export default function TableHeader({ isBenefitView, showPriorityColumn, tab }) {
  const showStatus = tab !== 'trending' && tab !== 'public';
  return (
    <thead className="bg-[#f0f4f8] dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
      <tr>
        <th className="text-left px-4 py-3">Product</th>
        {isBenefitView ? (
          <>
            <th className="text-left px-4 py-3">Stock</th>
            <th className="text-left px-4 py-3">Regular Price</th>
            <th className="text-left px-4 py-3">Sale Price</th>
            <th className="text-left px-4 py-3">Total Cost</th>
            <th className="text-left px-4 py-3">Unit Profit</th>
            <th className="text-left px-4 py-3">Total Profit</th>
          </>
        ) : (
          <>
            <th className="text-left px-4 py-3">Price</th>
            <th className="text-left px-4 py-3">Stock</th>
            <th className="text-left px-4 py-3">Category</th>
            {tab === 'trending' && <th className="text-left px-4 py-3">Trending</th>}
            <th className="text-left px-4 py-3">Ads</th>
            {showPriorityColumn && (
              <th className="text-left px-4 py-3">{tab === 'trending' ? 'Trending Sort' : 'Display Priority'}</th>
            )}
          </>
        )}
        {showStatus && <th className="text-left px-4 py-3">Status</th>}
        {!isBenefitView && <th className="text-right px-4 py-3">Actions</th>}
      </tr>
    </thead>
  );
}
