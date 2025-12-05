import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { useCpanel } from '../../context/CpanelProvider';
import { deleteCategory, getCategories } from '../../api/catalog';

export default function CategoryList() {
  const { api, user } = useCpanel();
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const isAdmin = user?.employeeRole === 'admin';

  const fetchCategories = useMemo(
    () => async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (status !== 'all') params.status = status;
        const res = await getCategories(api, params);
        setCategories(res.data?.categories || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    },
    [api, status],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Delete this category? Products will remain but category becomes unavailable.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteCategory(api, id);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">Categories</h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">Organize products and set display order.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <Link to="/cpanel/categories/add" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition">
            + Add Category
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Display Order</th>
                <th className="text-left px-4 py-3">Products</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    Loading categories...
                  </td>
                </tr>
              ) : null}
              {!loading && error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : null}
              {!loading && !error && categories.map((cat) => (
                <tr key={cat._id || cat.id} className="border-t border-primary/10">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-14 h-14 rounded-lg object-cover border border-primary/15" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/15 flex items-center justify-center text-[10px] font-semibold text-text-secondary">
                          IMG
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-text-primary dark:text-text-light text-base">{cat.name}</div>
                        <div className="text-xs text-text-secondary dark:text-text-light/70">
                          {cat.categoryCode || cat.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">{cat.displayOrder}</td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">{cat.productCount ?? 0}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cat.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/cpanel/categories/edit/${cat._id || cat.id}`}
                        className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition"
                        title="Edit"
                      >
                        <FiEye />
                      </Link>
                      {isAdmin ? (
                        <button
                          disabled={deletingId === (cat._id || cat.id)}
                          onClick={() => handleDelete(cat._id || cat.id)}
                          className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                          title="Delete"
                        >
                          ✕
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No categories found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
