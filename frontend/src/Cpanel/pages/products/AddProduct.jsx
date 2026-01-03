import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud } from 'react-icons/fi';
import { useCpanel } from '../../context/CpanelProvider';
import { createProduct, getCategories, getProduct, updateProduct, uploadProductImages } from '../../api/catalog';
import { clearListCache } from './components/cache';

export default function AddProduct() {
  const { api } = useCpanel();
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(productId);
  const initialFormState = {
    name: '',
    brand: '',
    totalCost: '',
    regularPrice: '',
    salePrice: '',
    stock: '',
    category: '',
    shortDesc: '',
    description: '',
    featured: false,
    exclusive: false,
    status: 'Draft',
    displayPriority: '',
  };
  const [form, setForm] = useState({
    ...initialFormState,
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [error, setError] = useState('');
  const [removeImagePublicIds, setRemoveImagePublicIds] = useState([]);
  const [coverImageId, setCoverImageId] = useState(null);
  const [previewIdx, setPreviewIdx] = useState(0);

  const previewPrice = form.salePrice || '0.00';
  const previewName = form.name || 'Product Name';
  const previewShort = form.shortDesc || 'Short description';
  const previewCat = useMemo(() => {
    const found = categories.find((cat) => cat._id === form.category);
    return found?.name || 'Category';
  }, [categories, form.category]);
  const displayImages = useMemo(() => {
    if (!images.length) return [];
    const arranged = [...images];
    if (coverImageId) {
      const coverIndex = arranged.findIndex((img) => img.id === coverImageId);
      if (coverIndex > 0) {
        const [cover] = arranged.splice(coverIndex, 1);
        arranged.unshift(cover);
      }
    }
    return arranged;
  }, [images, coverImageId]);

  useEffect(() => {
    setPreviewIdx(0);
  }, [displayImages.length, coverImageId]);

  const previewImage = displayImages[previewIdx]?.url || null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories(api, { limit: 100, status: 'Active' });
        setCategories(res.data?.categories || []);
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    loadCategories();
  }, [api]);

  useEffect(() => {
    if (!isEdit) return;
    const loadProduct = async () => {
      try {
        const res = await getProduct(api, productId);
        const product = res.data?.product;
        if (!product) throw new Error('Missing product');
        setForm({
          name: product.name || '',
          brand: product.brand || '',
          totalCost: product.totalCost ?? '',
          regularPrice: product.regularPrice ?? '',
          salePrice: product.salePrice ?? '',
          stock: product.stock ?? '',
          category: product.category?._id || product.category || '',
          shortDesc: product.shortDescription || '',
          description: product.description || '',
          featured: !!product.isFeatured,
          exclusive: !!product.isExclusive,
          status: product.status || 'Draft',
          displayPriority: product.displayPriority ?? '',
        });
        setImages(
          (product.images || []).map((img, idx) => ({
            id: img.publicId || `${img.url}-${idx}`,
            url: img.url,
            publicId: img.publicId,
            order: img.order ?? idx,
            isNew: false,
            alt: img.alt || '',
          })),
        );
        setCoverImageId((product.images || [])[0]?.publicId || null);
        setRemoveImagePublicIds([]);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoadingProduct(false);
      }
    };
    loadProduct();
  }, [api, isEdit, productId]);

  const primaryBadge = useMemo(() => {
    if (form.featured) return 'Featured';
    if (form.exclusive) return 'Exclusive';
    return null;
  }, [form.featured, form.exclusive]);

  const handleImages = (files) => {
    if (!files?.length) return;
    setError('');
    const remaining = 20 - images.length;
    if (remaining <= 0) {
      setError('Maximum 20 images allowed');
      return;
    }
    const fileArr = Array.from(files).slice(0, remaining);
    const mapped = fileArr.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      isNew: true,
    }));
    setImages((prev) => {
      const next = [...prev, ...mapped];
      if (!coverImageId && next.length) {
        setCoverImageId(next[0].id);
      }
      return next;
    });
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.publicId) {
        setRemoveImagePublicIds((list) => [...list, target.publicId]);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearImages = () => {
    const publicIds = images.map((img) => img.publicId).filter(Boolean);
    if (publicIds.length) {
      setRemoveImagePublicIds((list) => [...list, ...publicIds]);
    }
    setImages([]);
  };

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

  const makeCover = (id) => {
    setCoverImageId(id);
  };

  const resetForm = () => {
    setForm({ ...initialFormState });
    setImages([]);
    setCoverImageId(null);
    setRemoveImagePublicIds([]);
    setError('');
  };

  const buildPayload = async (statusOverride) => {
    const newImages = images.filter((img) => img.isNew && img.file);
    const newFiles = newImages.map((img) => img.file);
    let uploaded = [];

    if (newFiles.length) {
      try {
        const res = await uploadProductImages(api, newFiles);
        const uploadedFromApi = res.data?.images || [];
        uploaded = uploadedFromApi.map((img, idx) => {
          const original = newImages[idx];
          return {
            id: original?.id || img.publicId || `uploaded-${idx}`,
            url: img.url,
            publicId: img.publicId,
            order: images.length + idx,
            isNew: false,
            alt: original?.alt || '',
          };
        });
      } catch (err) {
        setError('Failed to upload images');
        throw err;
      }
    }

    const existingImages = images.filter((img) => !img.isNew);
    const mergedImages = [...existingImages, ...uploaded];
    const orderedImages = [...mergedImages];
    if (coverImageId) {
      const coverIndex = orderedImages.findIndex((img) => img.id === coverImageId);
      if (coverIndex > 0) {
        const [cover] = orderedImages.splice(coverIndex, 1);
        orderedImages.unshift(cover);
      }
    }

    const preparedImages = orderedImages
      .map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt || '',
        order: idx,
      }))
      .filter((img) => img.url);

    const payload = {
      name: form.name?.trim(),
      brand: form.brand?.trim() || undefined,
      totalCost: Number(form.totalCost),
      regularPrice: Number(form.regularPrice),
      salePrice: Number(form.salePrice),
      stock: Number(form.stock),
      category: form.category,
      shortDescription: form.shortDesc?.trim() || undefined,
      description: form.description?.trim() || undefined,
      isFeatured: form.featured,
      isExclusive: form.exclusive,
      status: statusOverride || form.status,
      displayPriority: form.displayPriority === '' ? undefined : Number(form.displayPriority),
      images: preparedImages,
      removeImagePublicIds: removeImagePublicIds.length ? removeImagePublicIds : undefined,
    };
    return payload;
  };

  const handleSubmit = async (statusOverride) => {
    setError('');
    if (!form.name?.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.category) {
      setError('Category is required');
      return;
    }
    if (form.salePrice === '' || Number.isNaN(Number(form.salePrice))) {
      setError('Sale price is required');
      return;
    }
    if (form.totalCost === '' || Number.isNaN(Number(form.totalCost))) {
      setError('Total cost is required');
      return;
    }
    if (form.stock === '' || Number.isNaN(Number(form.stock))) {
      setError('Stock is required');
      return;
    }
    // Allow saving/publishing even without images while Cloudinary is skipped.
    const statusToUse = statusOverride || form.status;
    setSaving(true);
    try {
      const payload = await buildPayload(statusOverride);
      if (statusOverride) {
        setForm((prev) => ({ ...prev, status: statusOverride }));
      }
      if (isEdit) {
        await updateProduct(api, productId, payload);
      } else {
        await createProduct(api, payload);
      }
      clearListCache();
      navigate('/cpanel/products/list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return <div className="text-text-secondary dark:text-text-light/70">Loading product...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-light/70">
              Enter details to {isEdit ? 'update' : 'publish'} your product.
            </p>
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
                    <button
                      type="button"
                      onClick={() => makeCover(img.id)}
                      className={`absolute top-1 left-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-soft transition ${
                        coverImageId === img.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/80 text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                      }`}
                      title={coverImageId === img.id ? 'Cover image' : 'Set as cover'}
                    >
                      ✓
                    </button>
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
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Sale Price *</label>
              <input
                type="number"
                min="0"
                value={form.salePrice}
                onChange={(e) => handleChange('salePrice', e.target.value)}
                placeholder="120"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Regular Price *</label>
              <input
                type="number"
                min="0"
                value={form.regularPrice}
                onChange={(e) => handleChange('regularPrice', e.target.value)}
                placeholder="125"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Total Cost *</label>
              <input
                type="number"
                min="0"
                value={form.totalCost}
                onChange={(e) => handleChange('totalCost', e.target.value)}
                placeholder="105"
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
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
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
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
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
          <div className="w-full h-48 rounded-lg overflow-hidden border border-primary/10 bg-white dark:bg-dark-hover flex items-center justify-center p-2 relative group">
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                  onClick={() => setPreviewIdx((idx) => (idx - 1 + displayImages.length) % displayImages.length)}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                  onClick={() => setPreviewIdx((idx) => (idx + 1) % displayImages.length)}
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {displayImages.map((img, idx) => (
                    <span
                      key={img.id || img.publicId || img.url || idx}
                      className={`h-1.5 w-1.5 rounded-full ${idx === previewIdx ? 'bg-primary' : 'bg-primary/30'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-text-secondary text-sm">Preview</div>
            )}
          </div>
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

        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-secondary dark:text-text-light/70">Status</div>
          <div className="flex flex-col gap-2">
            {['Draft', 'Published', 'Archived'].map((status) => (
              <label key={status} className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={form.status === status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                {status}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-text-secondary dark:text-text-light/70">Ads selections</div>
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="text-primary focus:ring-primary"
              />
              Featured product
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary dark:text-text-light/80 mt-1">
              <input
                type="checkbox"
                checked={form.exclusive}
                onChange={(e) => handleChange('exclusive', e.target.checked)}
                className="text-primary focus:ring-primary"
              />
              Exclusive / limited edition
            </label>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            disabled={saving}
            className="w-full sm:flex-1 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition disabled:opacity-60"
            onClick={() => handleSubmit()}
            type="button"
          >
            {saving
              ? 'Saving...'
              : form.status === 'Published'
              ? 'Publish Product'
              : form.status === 'Archived'
              ? 'Archive Product'
              : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={resetForm}
            className="w-full sm:w-auto sm:px-4 sm:flex-none px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </aside>
    </div>
  );
}
