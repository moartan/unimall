import { API_BASE_URL } from '../../shared/api/client';

// Thin helpers around the authenticated Cpanel axios instance.
export const getProducts = (api, params = {}) =>
  api.get('/employee/products', { params });

export const getProduct = (api, idOrSlug) =>
  api.get(`/employee/products/${idOrSlug}`);

export const createProduct = (api, payload) =>
  api.post('/employee/products', payload);

export const updateProduct = (api, idOrSlug, payload) =>
  api.put(`/employee/products/${idOrSlug}`, payload);

export const deleteProduct = (api, idOrSlug, permanent = false) =>
  api.delete(`/employee/products/${idOrSlug}${permanent ? '?permanent=true' : ''}`);

export const restoreProduct = (api, idOrSlug) =>
  api.post(`/employee/products/${idOrSlug}/restore`);

export const getCategories = (api, params = {}) =>
  api.get('/employee/categories', { params });

export const getCategory = (api, id) =>
  api.get(`/employee/categories/${id}`);

export const createCategory = (api, payload) =>
  api.post('/employee/categories', payload);

export const updateCategory = (api, id, payload) =>
  api.put(`/employee/categories/${id}`, payload);

export const deleteCategory = (api, id) =>
  api.delete(`/employee/categories/${id}`);

export const updateProductPriority = (api, id, displayPriority) =>
  api.patch(`/employee/products/${id}/priority`, { displayPriority });

// Admin: customers
export const getCustomers = (api, params = {}) =>
  api.get('/cpanel/customers', { params });

// Employee: orders
export const getOrders = (api, params = {}) =>
  api.get('/employee/orders', { params });

export const uploadProductImages = (api, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return api.post('/employee/media/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Convenience for public search paths if needed elsewhere.
export const getPublicProductSearchUrl = (query, limit = 6) =>
  `${API_BASE_URL}/catalog/products?q=${encodeURIComponent(query)}&limit=${limit}`;
