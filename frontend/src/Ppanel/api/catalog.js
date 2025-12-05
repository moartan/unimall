import { baseClient } from '../../shared/api/client';

export const fetchPublishedProducts = (params = {}) => {
  const finalParams = { ...params, status: 'Published' };
  if (finalParams.category) {
    // accept slug or id; pass through; backend will match id or slug
    finalParams.category = finalParams.category;
  }
  return baseClient.get('/catalog/products', { params: finalParams });
};

export const fetchProductDetail = (idOrSlug) =>
  baseClient.get(`/catalog/products/${idOrSlug}`);

export const fetchCategories = (params = {}) =>
  baseClient.get('/catalog/categories', { params: { status: 'Active', ...params } });
