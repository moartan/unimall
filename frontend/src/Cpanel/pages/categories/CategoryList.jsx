import { FiEye } from 'react-icons/fi';

const mockCategories = [
  {
    id: 'CTC-89750FPZ',
    name: 'Mobile',
    order: 1,
    status: 'Active',
    products: 128,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'CTC-P95RNA5B',
    name: 'Laptop',
    order: 2,
    status: 'Active',
    products: 86,
    image: '',
  },
  {
    id: 'CTC-4SPDKA2G',
    name: 'Watch',
    order: 3,
    status: 'Active',
    products: 64,
    image: '',
  },
  {
    id: 'CTC-RPEZENBO',
    name: 'Camera',
    order: 4,
    status: 'Active',
    products: 52,
    image: '',
  },
  {
    id: 'CTC-DK9VHUOS',
    name: 'Audio',
    order: 5,
    status: 'Active',
    products: 74,
    image: '',
  },
  {
    id: 'CTC-FEB3YVN6',
    name: 'Tablet',
    order: 6,
    status: 'Active',
    products: 91,
    image: '',
  },
];

export default function CategoryList() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">Categories</h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">Organize products and set display order.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light hover:bg-primary/10 transition">
            Import
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition">
            + Add Category
          </button>
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
              {mockCategories.map((cat) => (
                <tr key={cat.id} className="border-t border-primary/10">
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
                        <div className="text-xs text-text-secondary dark:text-text-light/70">{cat.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">{cat.order}</td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light font-semibold">{cat.products}</td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{cat.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="p-2 rounded-lg border border-primary/15 text-text-secondary hover:bg-primary/10 transition">
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
