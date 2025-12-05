import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud } from 'react-icons/fi';
import { useCpanel } from '../../context/CpanelProvider';
import { createProduct, getCategories, getProduct, updateProduct, uploadProductImages } from '../../api/catalog';

const generateSku = (name) => {
  const base = (name || '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
    .slice(0, 16);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const prefix = base || 'PRD';
  return `${prefix}-${rand}`;
};

export default function AddProduct() {
  const { api } = useCpanel();
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(productId);
  const initialFormState = {
    name: '',
    brand: '',
    sku: '',
    currentPrice: '',
    originalPrice: '',
    costPrice: '',
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
    status: 'Draft',
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
  const [variants, setVariants] = useState([]);
  const [skuEdited, setSkuEdited] = useState(false);

  const previewPrice = form.currentPrice || '0.00';
  const previewName = form.name || 'Product Name';
  const previewShort = form.shortDesc || 'Short description';
  const previewCat = useMemo(() => {
    const found = categories.find((cat) => cat._id === form.category);
    return found?.name || 'Category';
  }, [categories, form.category]);
  const previewImage = useMemo(() => {
    if (!images.length) return null;
    const cover = images.find((img) => img.id === coverImageId);
    return (cover || images[0])?.url;
  }, [coverImageId, images]);

  const handleChange = (key, value) => {
    if (key === 'name') {
      setForm((prev) => {
        const next = { ...prev, name: value };
        if (!skuEdited && value) {
          next.sku = generateSku(value);
        }
        return next;
      });
    } else if (key === 'sku') {
      setSkuEdited(true);
      setForm((prev) => ({ ...prev, sku: value }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
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
          sku: product.sku || '',
          currentPrice: product.currentPrice ?? '',
          originalPrice: product.originalPrice ?? '',
          costPrice: product.costPrice ?? '',
          stock: product.stock ?? '',
          category: product.category?._id || product.category || '',
          topLabel: product.topBarTag || '',
          promoEnd: product.promotionEndDate ? product.promotionEndDate.slice(0, 10) : '',
          shortDesc: product.shortDescription || '',
          description: product.description || '',
          featured: !!product.isFeatured,
          promoted: !!product.isPromoted,
          exclusive: !!product.isExclusive,
          tags: (product.tags || []).join(', '),
          keywords: (product.searchKeywords || []).join(', '),
          status: product.status || 'Draft',
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
        setVariants(
          (product.variants || []).map((v, idx) => ({
            id: v._id || `${v.name || 'variant'}-${idx}-${Math.random()}`,
            name: v.name || '',
            sku: v.sku || '',
            price: v.price ?? '',
            stock: v.stock ?? '',
          })),
        );
        setSkuEdited(!!product.sku);
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
    if (form.promoted) return 'Promoted';
    if (form.exclusive) return 'Exclusive';
    return null;
  }, [form.featured, form.promoted, form.exclusive]);

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
    setVariants([]);
    setError('');
    setSkuEdited(false);
  };

  const buildPayload = async (statusOverride) => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const keywords = form.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const toUpload = images.filter((img) => img.file);
    let uploaded = [];
    if (toUpload.length) {
      const res = await uploadProductImages(api, toUpload.map((img) => img.file));
      uploaded = res.data?.images || [];
    }
    const uploadedMap = new Map();
    toUpload.forEach((img, idx) => {
      if (uploaded[idx]) uploadedMap.set(img.id, uploaded[idx]);
    });

    const orderedImages = [...images];
    if (coverImageId) {
      const coverIndex = orderedImages.findIndex((img) => img.id === coverImageId);
      if (coverIndex > 0) {
        const [cover] = orderedImages.splice(coverIndex, 1);
        orderedImages.unshift(cover);
      }
    }

    const preparedImages = orderedImages.map((img, idx) => {
      const uploadedImg = uploadedMap.get(img.id);
      return {
        url: uploadedImg?.url || img.url,
        publicId: uploadedImg?.publicId || img.publicId,
        alt: img.alt || '',
        order: idx,
      };
    }).filter((img) => img.url);

    const preparedVariants = variants
      .filter((v) => v.name?.trim() || v.sku?.trim() || v.price !== '' || v.stock !== '')
      .map((v) => ({
        name: v.name?.trim() || undefined,
        sku: v.sku?.trim() || undefined,
        price: v.price === '' ? undefined : Number(v.price),
        stock: v.stock === '' ? 0 : Number(v.stock),
      }));

    const payload = {
      name: form.name?.trim(),
      brand: form.brand?.trim() || undefined,
      sku: form.sku?.trim() || undefined,
      currentPrice: Number(form.currentPrice),
      originalPrice: form.originalPrice === '' ? undefined : Number(form.originalPrice),
      costPrice: Number(form.costPrice),
      stock: Number(form.stock),
      category: form.category,
      topBarTag: form.topLabel?.trim() || undefined,
      promotionEndDate: form.promoEnd ? new Date(form.promoEnd).toISOString() : undefined,
      shortDescription: form.shortDesc?.trim() || undefined,
      description: form.description?.trim() || undefined,
      isFeatured: form.featured,
      isPromoted: form.promoted,
      isExclusive: form.exclusive,
      tags,
      searchKeywords: keywords,
      status: statusOverride || form.status,
      images: preparedImages,
      removeImagePublicIds: removeImagePublicIds.length ? removeImagePublicIds : undefined,
      variants: preparedVariants,
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
    if (form.currentPrice === '' || Number.isNaN(Number(form.currentPrice))) {
      setError('Current price is required');
      return;
    }
    if (form.costPrice === '' || Number.isNaN(Number(form.costPrice))) {
      setError('Cost price is required');
      return;
    }
    if (form.stock === '' || Number.isNaN(Number(form.stock))) {
      setError('Stock is required');
      return;
    }
    const statusToUse = statusOverride || form.status;
    if (statusToUse === 'Published' && images.length === 0) {
      setError('At least one image is required to publish a product');
      return;
    }
    const skuSet = new Set();
    const productSku = form.sku?.trim().toLowerCase();
    for (const v of variants) {
      if (v.sku) {
        const key = v.sku.trim().toLowerCase();
        if (productSku && key === productSku) {
          setError('Variant SKU cannot match product SKU');
          return;
        }
        if (skuSet.has(key)) {
          setError('Variant SKUs must be unique');
          return;
        }
        skuSet.add(key);
      }
    }

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
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Product SKU</label>
              <div className="flex gap-2">
                <input
                  value={form.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="SKU-PROD-001"
                  className="flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg border border-primary/20 text-sm text-text-primary dark:text-text-light hover:bg-primary/10 transition"
                  onClick={() => {
                    const next = generateSku(form.name || 'PRD');
                    setForm((prev) => ({ ...prev, sku: next }));
                    setSkuEdited(true);
                  }}
                >
                  Generate
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Current Price *</label>
              <input
                type="number"
                min="0"
                value={form.currentPrice}
                onChange={(e) => handleChange('currentPrice', e.target.value)}
                placeholder="499"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Original Price</label>
              <input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) => handleChange('originalPrice', e.target.value)}
                placeholder="599"
                className="w-full rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-text-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-text-light">Cost Price *</label>
              <input
                type="number"
                min="0"
                value={form.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                placeholder="400"
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

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-text-primary dark:text-text-light">Variants &amp; SKUs</div>
                <div className="text-xs text-text-secondary dark:text-text-light/70">
                  Optional variants; leave blank if not needed.
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    { id: `variant-${Date.now()}-${Math.random()}`, name: '', sku: '', price: '', stock: '' },
                  ])
                }
                className="px-3 py-2 rounded-lg border border-primary/20 text-sm text-text-primary dark:text-text-light hover:bg-primary/10 transition"
              >
                + Add variant
              </button>
            </div>
            {variants.length ? (
              <div className="space-y-2">
                {variants.map((variant, idx) => (
                  <div
                    key={variant.id}
                    className="grid md:grid-cols-4 gap-3 items-end rounded-xl border border-primary/15 bg-light-bg dark:bg-dark-bg p-3"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary dark:text-text-light/80">Name</label>
                      <input
                        value={variant.name}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v) => (v.id === variant.id ? { ...v, name: e.target.value } : v)),
                          )
                        }
                        placeholder="Size / Color"
                        className="w-full rounded-lg border border-primary/20 bg-white dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-text-primary dark:text-text-light"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary dark:text-text-light/80">SKU</label>
                      <input
                        value={variant.sku}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v) => (v.id === variant.id ? { ...v, sku: e.target.value } : v)),
                          )
                        }
                        placeholder="SKU123"
                        className="w-full rounded-lg border border-primary/20 bg-white dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-text-primary dark:text-text-light"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary dark:text-text-light/80">Price</label>
                      <input
                        type="number"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v) => (v.id === variant.id ? { ...v, price: e.target.value } : v)),
                          )
                        }
                        placeholder="0"
                        className="w-full rounded-lg border border-primary/20 bg-white dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-text-primary dark:text-text-light"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary dark:text-text-light/80">Stock</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v) => (v.id === variant.id ? { ...v, stock: e.target.value } : v)),
                            )
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-primary/20 bg-white dark:bg-dark-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-text-primary dark:text-text-light"
                        />
                        <button
                          type="button"
                          onClick={() => setVariants((prev) => prev.filter((v) => v.id !== variant.id))}
                          className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Remove variant"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-secondary dark:text-text-light/70 border border-dashed border-primary/20 rounded-lg px-3 py-2">
                No variants added. You can add size/color options here.
              </div>
            )}
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
            {/* Actions moved to sidebar */}
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
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <button
            disabled={saving}
            className="w-full px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition disabled:opacity-60"
            onClick={() => handleSubmit('Draft')}
            type="button"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            disabled={saving}
            className="w-full px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition disabled:opacity-60"
            onClick={() => handleSubmit('Published')}
            type="button"
          >
            {saving ? 'Saving...' : 'Publish Product'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={resetForm}
            className="w-full px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </aside>
    </div>
  );
}
