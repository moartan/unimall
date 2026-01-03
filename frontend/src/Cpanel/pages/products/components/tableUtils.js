export const statusClass = (status) =>
  status === 'Published'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : 'bg-amber-50 text-amber-700 border border-amber-200';

export const adsBadges = (product) => {
  const badges = [];
  if (product.isFeatured) {
    badges.push({ label: 'Featured', className: 'text-emerald-700 border border-emerald-300 bg-emerald-50' });
  }
  if (product.isExclusive) {
    badges.push({ label: 'Exclusive', className: 'text-blue-700 border border-blue-300 bg-blue-50' });
  }
  if (!badges.length) {
    badges.push({ label: 'No ads', className: 'text-rose-700 border border-rose-300 bg-rose-50' });
  }
  return badges;
};
