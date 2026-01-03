export const tabs = [
  {
    key: 'all',
    label: 'All',
    applyParams: (params, state) => {
      if (state.status !== 'all') params.status = state.status;
    },
    processProducts: (list) => ({ list, total: null }),
  },
  {
    key: 'public',
    label: 'Customer View',
    showPriority: true,
    applyParams: (params) => {
      params.status = 'Published';
      params.sort = '-isExclusive -isFeatured displayPriority createdAt';
    },
    processProducts: (list) => {
      const exclusive = list.filter((p) => p.isExclusive);
      const featured = list.filter((p) => !p.isExclusive && p.isFeatured);
      const rest = list.filter((p) => !p.isExclusive && !p.isFeatured);
      return { list: [...exclusive, ...featured, ...rest], total: null };
    },
  },
  {
    key: 'featured',
    label: 'Featured',
    showPriority: true,
    applyParams: (params) => {
      params.featured = true;
      params.sort = 'displayPriority createdAt';
    },
    processProducts: (list) => ({ list, total: null }),
  },
  {
    key: 'exclusive',
    label: 'Exclusive',
    showPriority: true,
    applyParams: (params) => {
      params.sort = 'displayPriority createdAt';
    },
    processProducts: (list) => {
      const filtered = list.filter((p) => p.isExclusive);
      return { list: filtered, total: filtered.length };
    },
  },
  {
    key: 'draft',
    label: 'Draft',
    applyParams: (params) => {
      params.status = 'Draft';
    },
    processProducts: (list) => ({ list, total: null }),
  },
  {
    key: 'archived',
    label: 'Archived',
    applyParams: (params) => {
      params.status = 'Archived';
    },
    processProducts: (list) => ({ list, total: null }),
  },
  {
    key: 'outofstock',
    label: 'Out of Stock',
    applyParams: () => {},
    processProducts: (list) => {
      const filtered = list.filter((p) => (p.stock ?? 0) <= 0);
      return { list: filtered, total: filtered.length };
    },
  },
  {
    key: 'trending',
    label: 'Trending',
    showPriority: true,
    applyParams: (params) => {
      params.status = 'Published';
      params.sort = 'trendingSort displayPriority createdAt';
    },
    processProducts: (list) => {
      const published = list.filter((p) => p.status === 'Published');
      const sorted = [...published].sort((a, b) => {
        const aSort = a.trendingSort ?? a.displayPriority ?? 9999;
        const bSort = b.trendingSort ?? b.displayPriority ?? 9999;
        if (aSort === bSort) return 0;
        return aSort < bSort ? -1 : 1;
      });
      return { list: sorted, total: sorted.length };
    },
  },
  {
    key: 'benefit',
    label: 'Profit View',
    isBenefit: true,
    applyParams: () => {},
    processProducts: (list) => ({ list, total: null }),
  },
];

export const getTabConfig = (key) => tabs.find((t) => t.key === key) || tabs[0];
