import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { adsBadges, statusClass } from './tableUtils';

export default function ProductRow({
  product,
  idx,
  productsLength,
  tierRank,
  showPriorityColumn,
  savingPriority,
  onPriorityChange,
  onDelete,
  isAdmin,
  deletingId,
  onView,
  onRestore,
  tab,
  restoringId,
  onToggleTrending,
  togglingTrendingId,
}) {
  const displayRank = tab === 'trending' ? (product.isTrending ? product.trendingSort ?? idx + 1 : '—') : tierRank || idx + 1;
  const rankLabel =
    tab === 'trending'
      ? product.isTrending
        ? `#${displayRank}`
        : ''
      : `#${displayRank}`;
  const stripe =
    idx % 2 === 0 ? 'bg-white dark:bg-dark-card/40' : 'bg-light-bg/60 dark:bg-dark-hover/50';

  return (
    <tr
      className={`border-t border-primary/10 ${stripe} ${onView ? 'cursor-pointer hover:bg-primary/5' : ''}`}
      onClick={() => onView?.(product)}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-primary/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-light-bg dark:bg-dark-hover border border-primary/10 flex items-center justify-center text-[10px] font-semibold text-text-secondary">
              IMG
            </div>
          )}
          <div>
            <div className="font-semibold text-text-primary dark:text-text-light">{product.name}</div>
            <div className="text-xs text-text-secondary dark:text-text-light/70">{product.productCode || product._id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-text-primary dark:text-text-light font-semibold">
          ${Number(product.salePrice || 0).toLocaleString()}
        </div>
        {product.regularPrice ? (
          <div className="text-xs line-through text-text-secondary/70">${Number(product.regularPrice).toLocaleString()}</div>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <div
          className={`font-semibold ${
            product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {product.stock > 0 ? 'Available' : 'Out of stock'}
        </div>
        <div className="text-xs text-text-secondary dark:text-text-light/70">{product.stock} Stock</div>
      </td>
      <td className="px-4 py-4 text-text-primary dark:text-text-light">
        {product.category?.name || product.category?.slug || '—'}
      </td>
      {tab === 'trending' && (
        <td className="px-4 py-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleTrending?.(product._id, !product.isTrending);
            }}
            disabled={togglingTrendingId === product._id}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              product.isTrending ? 'bg-primary' : 'bg-slate-200'
            }`}
            aria-label={product.isTrending ? 'Set trending inactive' : 'Set trending active'}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                product.isTrending ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </td>
      )}
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {adsBadges(product).map((badge) => (
            <span
              key={badge.label}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </td>
      {showPriorityColumn ? (
        <td
          className="px-4 py-4"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {tab === 'trending' && !product.isTrending ? (
            <span className="text-sm text-text-secondary">—</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                {rankLabel}
              </span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="p-1 rounded-md border border-primary/20 text-xs hover:bg-primary/10 transition disabled:opacity-50"
                  disabled={idx === 0 || savingPriority === product._id || (tab === 'trending' && !product.isTrending)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPriorityChange(idx, -1);
                  }}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="p-1 rounded-md border border-primary/20 text-xs hover:bg-primary/10 transition disabled:opacity-50"
                  disabled={
                    idx === productsLength - 1 || savingPriority === product._id || (tab === 'trending' && !product.isTrending)
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onPriorityChange(idx, 1);
                  }}
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          )}
        </td>
      ) : (
        <td className="px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {adsBadges(product).map((badge) => (
              <span
                key={badge.label}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </td>
      )}
      {tab !== 'trending' && tab !== 'public' && (
        <td className="px-4 py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(product.status)}`}>
            {product.status}
          </span>
        </td>
      )}
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-2 text-text-secondary dark:text-text-light">
          <Link
            to={`/cpanel/products/edit/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition"
            title="Edit"
          >
            <FiEdit2 />
          </Link>
          {isAdmin ? (
            tab === 'archived' ? (
              <button
                disabled={restoringId === product._id}
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(product._id);
                }}
                className="p-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50"
                title="Restore"
              >
                Restore
              </button>
            ) : (
              <button
                disabled={deletingId === product._id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product._id);
                }}
                className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            )
          ) : null}
        </div>
      </td>
    </tr>
  );
}
