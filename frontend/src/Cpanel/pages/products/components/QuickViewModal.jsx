import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { statusClass } from './tableUtils';
import { useEffect, useState } from 'react';

export default function QuickViewModal({ product, onClose }) {
  if (!product) return null;
  const [imageIdx, setImageIdx] = useState(0);
  const images = product.images || [];
  const image = images[imageIdx]?.url;
  const unitProfit = Number((product.salePrice || 0) - (product.totalCost || 0));

  useEffect(() => {
    setImageIdx(0);
  }, [product]);

  const prevImage = () => {
    if (!images.length) return;
    setImageIdx((idx) => (idx - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    if (!images.length) return;
    setImageIdx((idx) => (idx + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-strong dark:bg-dark-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-text-secondary hover:bg-primary/10"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group relative rounded-2xl border border-primary/10 bg-light-bg/60 dark:bg-dark-hover/60 h-[320px] flex items-center justify-center overflow-hidden">
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                  aria-label="Next image"
                >
                  <FiChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((img, idx) => (
                    <span
                      key={img.publicId || img.url || idx}
                      className={`h-1.5 w-1.5 rounded-full ${idx === imageIdx ? 'bg-primary' : 'bg-primary/30'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {image ? (
              <img src={image} alt={product.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-text-secondary text-sm">No image</div>
            )}
          </div>
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase text-primary">
              {product.category?.name || 'Uncategorized'}
            </div>
            <div className="text-2xl font-bold text-text-primary dark:text-text-light">{product.name}</div>
            <div className="text-sm text-text-secondary dark:text-text-light/80">
              {product.shortDescription || 'No description available.'}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-extrabold text-text-primary dark:text-text-light">
                ${Number(product.salePrice || 0).toLocaleString()}
              </div>
              {product.regularPrice ? (
                <div className="text-sm line-through text-text-secondary/70">
                  ${Number(product.regularPrice).toLocaleString()}
                </div>
              ) : null}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(product.status)}`}>
                {product.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-primary/10 bg-light-bg/70 dark:bg-dark-hover/60 p-3">
                <div className="text-xs text-text-secondary dark:text-text-light/60 uppercase font-semibold">Stock</div>
                <div className="text-lg font-bold text-text-primary dark:text-text-light">{product.stock ?? 0}</div>
              </div>
              <div className="rounded-xl border border-primary/10 bg-light-bg/70 dark:bg-dark-hover/60 p-3">
                <div className="text-xs text-text-secondary dark:text-text-light/60 uppercase font-semibold">Unit Profit</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${unitProfit.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-primary/10 bg-light-bg/70 dark:bg-dark-hover/60 p-3">
                <div className="text-xs text-text-secondary dark:text-text-light/60 uppercase font-semibold">Code</div>
                <div className="text-lg font-bold text-text-primary dark:text-text-light">
                  {product.productCode || '—'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.isExclusive ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  Exclusive
                </span>
              ) : null}
              {product.isFeatured ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Featured
                </span>
              ) : null}
              {!product.isExclusive && !product.isFeatured ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                  No ads
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
