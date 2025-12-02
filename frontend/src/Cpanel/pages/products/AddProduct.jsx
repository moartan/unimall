import { useMemo, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

const categories = ['Tablet', 'Audio', 'Camera', 'Laptop', 'Watch', 'Accessories'];

export default function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    compareAt: '',
    stock: '',
    category: '',
    topLabel: '',
    promoEnd: '',
    shortDesc: '',
    description: '',
    featured: false,
    promoted: false,
    exclusive: false,
    tags: '',
    keywords: '',
    status: 'draft',
  });
  const [images, setImages] = useState([]);
  const [dragId, setDragId] = useState(null);

  const previewPrice = form.price || '0.00';
  const previewName = form.name || 'Product Name';
  const previewShort = form.shortDesc || 'Short description';
  const previewCat = form.category || 'Category';
  const previewImage = images[0]?.url;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const primaryBadge = useMemo(() => {
    if (form.featured) return 'Featured';
    if (form.promoted) return 'Promoted';
    if (form.exclusive) return 'Exclusive';
    return null;
  }, [form.featured, form.promoted, form.exclusive]);

  const handleImages = (files) => {
    if (!files?.length) return;
    const fileArr = Array.from(files).slice(0, 20 - images.length);
    const mapped = fileArr.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearImages = () => setImages([]);

  const handleDragStart = (id) => setDragId(id);
  const handleDrop = (id) => {
    if (!dragId || dragId === id) return;
    const current = [...images];
    const fromIndex = current.findIndex((img) => img.id === dragId);
    const toIndex = current.findIndex((img) => img.id === id);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setImages(current);
    setDragId(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">Add Product</h1>
            <p className="text-sm text-text-secondary dark:text-text-light/70">
              Enter details to publish your new product.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {statusOptions.map((opt) => (
              <label key={opt.value} className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80">
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={form.status === opt.value}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-text-primary dark:text-text-light">Product Images *</label>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={clearImages}
                  type="button"
                  className="px-3 py-1 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition"
                >
                  Clear
                </button>
                <span className="text-text-secondary dark:text-text-light/70">{images.length}/20</span>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-light-bg dark:bg-dark-hover px-3 py-3">
              <div className="flex items-center gap-3 overflow-x-auto custom-scroll pb-2">
                <label className="shrink-0 w-36 h-36 cursor-pointer rounded-2xl border-2 border-dashed border-primary/30 bg-white dark:bg-dark-card flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImages(e.target.files)}
                  />
                  <div className="flex flex-col items-center gap-2 text-sm font-semibold">
                    <FiUploadCloud className="text-lg" />
                    <span>Upload</span>
                  </div>
                </label>

                {images.map((img) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(img.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(img.id)}
                    className="relative shrink-0 w-36 h-36 rounded-2xl overflow-hidden border border-primary/15 bg-white dark:bg-dark-card"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-600 text-white text-sm font-bold flex items-center justify-center shadow-soft"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter product name"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Apple, Samsung, ..."
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Current Price *</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="499"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Original Price</label>
              <input
                type="number"
                min="0"
                value={form.compareAt}
                onChange={(e) => handleChange('compareAt', e.target.value)}
                placeholder="599"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Top Bar Label</label>
              <input
                value={form.topLabel}
                onChange={(e) => handleChange('topLabel', e.target.value)}
                placeholder="25% OFF"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Promotion End Date</label>
              <input
                type="date"
                value={form.promoEnd}
                onChange={(e) => handleChange('promoEnd', e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary dark:text-text-light">Short Description</label>
            <input
              value={form.shortDesc}
              onChange={(e) => handleChange('shortDesc', e.target.value)}
              placeholder="Quick summary for product cards"
              className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary dark:text-text-light">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Full description shown on product page"
              className="w-full min-h-[140px] rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="text-primary focus:ring-primary"
              />
              Featured product
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80">
              <input
                type="checkbox"
                checked={form.promoted}
                onChange={(e) => handleChange('promoted', e.target.checked)}
                className="text-primary focus:ring-primary"
              />
              Promoted product
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80">
              <input
                type="checkbox"
                checked={form.exclusive}
                onChange={(e) => handleChange('exclusive', e.target.checked)}
                className="text-primary focus:ring-primary"
              />
              Exclusive / limited edition
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="summer, smart-watch, bluetooth"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Search Keywords</label>
              <input
                value={form.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="noise cancelling, AMOLED, USB-C"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button className="px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition">
              Save as Draft
            </button>
            <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition">
              Publish Product
            </button>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Product Preview</h3>
          <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition">
            <FiUploadCloud />
          </button>
        </div>

        <div className="rounded-xl border border-primary/10 bg-light-bg dark:bg-dark-hover p-4 space-y-3">
          {previewImage ? (
            <div className="w-full h-40 rounded-lg overflow-hidden border border-primary/10">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-40 rounded-lg bg-accent-bg dark:bg-dark-card flex items-center justify-center text-text-secondary">
              Preview
            </div>
          )}
          {primaryBadge ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {primaryBadge}
            </div>
          ) : null}
          <div className="text-xs text-primary font-semibold">{previewCat}</div>
          <div className="text-lg font-semibold text-text-primary dark:text-text-light">{previewName}</div>
          <div className="text-sm text-text-secondary dark:text-text-light/70">{previewShort}</div>
          <div className="text-xl font-bold text-text-primary dark:text-text-light">${previewPrice}</div>
        </div>

        <div className="text-xs text-text-secondary dark:text-text-light/70 space-y-1">
          <div className="font-semibold text-text-primary dark:text-text-light">Status</div>
          <div className="capitalize">{form.status}</div>
        </div>
      </aside>
    </div>
  );
}
