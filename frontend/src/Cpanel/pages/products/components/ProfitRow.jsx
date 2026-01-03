import { statusClass } from './tableUtils';

export default function ProfitRow({ product, idx, onView }) {
  const unitProfit = Number((product.salePrice || 0) - (product.totalCost || 0));
  const totalProfit = unitProfit * (product.stock || 0);
  return (
    <tr
      className={`border-t border-primary/10 ${
        idx % 2 === 0 ? 'bg-white dark:bg-dark-card/40' : 'bg-light-bg/60 dark:bg-dark-hover/50'
      } hover:bg-primary/5 ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView?.(product)}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover border border-primary/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 flex items-center justify-center text-[10px] font-semibold text-text-secondary">
              IMG
            </div>
          )}
          <div>
            <div className="font-semibold text-text-primary dark:text-text-light">{product.name}</div>
            <div className="text-xs text-text-secondary dark:text-text-light/70">{product.productCode || product._id}</div>
          </div>
        </div>
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
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-text-secondary dark:text-text-light/80 font-semibold">
          ${Number(product.regularPrice || 0).toLocaleString()}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-text-primary dark:text-text-light font-semibold">
          ${Number(product.salePrice || 0).toLocaleString()}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-text-secondary dark:text-text-light/80 font-semibold">
          ${Number(product.totalCost || 0).toLocaleString()}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
          ${unitProfit.toLocaleString()}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-indigo-700 dark:text-indigo-300 font-semibold">
          ${Number(totalProfit).toLocaleString()}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(product.status)}`}>
          {product.status}
        </span>
      </td>
    </tr>
  );
}
