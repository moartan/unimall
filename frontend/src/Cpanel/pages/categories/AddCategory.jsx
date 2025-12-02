import { useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';

export default function AddCategory() {
  const [form, setForm] = useState({
    name: '',
    order: '',
    status: 'active',
    description: '',
  });
  const [image, setImage] = useState('');

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImage = (file) => {
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">Add Category</h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">Create a new category and set its display order.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Category Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Mobile, Laptop, Accessories..."
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Display Order *</label>
              <input
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => handleChange('order', e.target.value)}
                placeholder="1"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              >
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary dark:text-text-light">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe this category"
              className="w-full min-h-[120px] rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button className="px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition">
              Save as Draft
            </button>
            <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition">
              Save Category
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-light">Preview</h3>
          </div>
          <label className="w-full h-40 rounded-xl border-2 border-dashed border-primary/25 bg-light-bg dark:bg-dark-hover flex flex-col items-center justify-center gap-2 cursor-pointer text-text-secondary hover:border-primary transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImage(e.target.files?.[0])}
            />
            {image ? (
              <img src={image} alt="Category" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <>
                <FiUploadCloud className="text-xl" />
                <span className="text-sm font-semibold">Upload image</span>
              </>
            )}
          </label>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-text-primary dark:text-text-light">{form.name || 'Category name'}</div>
            <div className="text-xs text-text-secondary dark:text-text-light/70">
              Order {form.order || '-'} · {form.status || 'active'}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
