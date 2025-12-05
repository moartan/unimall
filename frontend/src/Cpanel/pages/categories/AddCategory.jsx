import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud } from 'react-icons/fi';
import { useCpanel } from '../../context/CpanelProvider';
import { createCategory, getCategory, updateCategory } from '../../api/catalog';

export default function AddCategory() {
  const { api } = useCpanel();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isEdit = Boolean(categoryId);
  const [form, setForm] = useState({
    name: '',
    displayOrder: '',
    status: 'Active',
    description: '',
  });
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImage = (file) => {
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const clearImage = () => setImage('');

  useEffect(() => {
    if (!isEdit) return;
    const loadCategory = async () => {
      try {
        const res = await getCategory(api, categoryId);
        const cat = res.data?.category;
        if (!cat) throw new Error('Missing category');
        setForm({
          name: cat.name || '',
          displayOrder: cat.displayOrder ?? '',
          status: cat.status || 'Active',
          description: cat.description || '',
        });
        setImage(cat.image || '');
      } catch (err) {
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [api, categoryId, isEdit]);

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.displayOrder) {
      setError('Display order is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        displayOrder: Number(form.displayOrder),
        status: form.status,
        description: form.description?.trim() || undefined,
        image: image || undefined,
      };
      if (isEdit) {
        await updateCategory(api, categoryId, payload);
      } else {
        await createCategory(api, payload);
      }
      navigate('/cpanel/categories/list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">
            {isEdit ? 'Update category details.' : 'Create a new category and set its display order.'}
          </p>
        </div>
      </div>
      {loading ? (
        <div className="text-text-secondary dark:text-text-light/70">Loading category...</div>
      ) : (

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
                value={form.displayOrder}
                onChange={(e) => handleChange('displayOrder', e.target.value)}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
            {error ? (
              <div className="flex-1 text-sm text-rose-600">{error}</div>
            ) : null}
            <button
              disabled={saving}
              onClick={handleSubmit}
              type="button"
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
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
          {image ? (
            <button
              type="button"
              onClick={clearImage}
              className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition"
            >
              Remove image
            </button>
          ) : null}
          <div className="space-y-1">
            <div className="text-sm font-semibold text-text-primary dark:text-text-light">{form.name || 'Category name'}</div>
            <div className="text-xs text-text-secondary dark:text-text-light/70">
              Order {form.displayOrder || '-'} · {form.status || 'Active'}
            </div>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}
