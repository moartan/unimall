import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCpanel } from '../../context/CpanelProvider';
import { getProducts } from '../../api/catalog';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiMaximize,
  FiMinimize,
  FiTruck,
  FiDollarSign,
} from 'react-icons/fi';
import QuickViewModal from '../products/components/QuickViewModal';

const demoCustomers = [
  { id: 1, name: 'Walk-in', phone: 'N/A', type: 'Walk-in' },
  { id: 2, name: 'Amina Noor', phone: '+1 202-555-0112', type: 'Loyalty' },
  { id: 3, name: 'Brian Cole', phone: '+1 202-555-0172', type: 'Guest' },
  { id: 4, name: 'Call Center Lead', phone: '+1 202-555-0144', type: 'Call-in' },
];

const demoCart = [
  { id: 1, name: 'Wireless Headset', price: 79.99, qty: 1 },
  { id: 2, name: 'Desk Lamp', price: 24.99, qty: 2 },
];

export default function Pos() {
  const { search, pathname } = useLocation();
  const { api } = useCpanel();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const FULLSCREEN_KEY = 'posFullscreen';

  useEffect(() => {
    const params = new URLSearchParams(search);
    const urlFlag = params.get('fullscreen');
    const stored = localStorage.getItem(FULLSCREEN_KEY);
    if (urlFlag === '1') {
      setFullscreen(true);
      return;
    }
    if (urlFlag === '0') {
      setFullscreen(false);
      return;
    }
    if (stored === 'true') setFullscreen(true);
  }, [search]);

  useEffect(() => {
    localStorage.setItem(FULLSCREEN_KEY, fullscreen ? 'true' : 'false');
    const params = new URLSearchParams(search);
    if (fullscreen) {
      params.set('fullscreen', '1');
    } else {
      params.delete('fullscreen');
    }
    const nextSearch = params.toString();
    const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
    window.history.replaceState(null, '', nextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  useEffect(() => {
    const handler = () => {
      const active =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setNativeFullscreen(Boolean(active));
      if (!active) setFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('mozfullscreenchange', handler);
    document.addEventListener('MSFullscreenChange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('mozfullscreenchange', handler);
      document.removeEventListener('MSFullscreenChange', handler);
    };
  }, []);

  const enterNativeFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const exitNativeFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  const toggleFullscreen = () => {
    if (nativeFullscreen) {
      exitNativeFullscreen();
      setFullscreen(false);
      return;
    }
    setFullscreen(true);
    enterNativeFullscreen();
  };

  const filteredProducts = useMemo(() => {
    const q = productQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.productCode?.toLowerCase().includes(q)
    );
  }, [productQuery, products]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.toLowerCase();
    return demoCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );
  }, [customerQuery]);

  const subtotal = useMemo(
    () => demoCart.reduce((sum, item) => sum + item.price * item.qty, 0),
    []
  );
  const tax = useMemo(() => subtotal * 0.07, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductError('');
      try {
        const res = await getProducts(api, { limit: 60, status: 'Published', sort: '-createdAt' });
        const list = res.data?.products || [];
        setProducts(list);
      } catch (err) {
        setProductError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [api]);

  const Container = ({ children }) =>
    fullscreen ? (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-light-bg dark:bg-dark-bg px-3 lg:px-6 py-4">
        {children}
      </div>
    ) : (
      <div className="mx-auto transition-all duration-200 px-0 lg:px-0">{children}</div>
    );

  return (
    <Container>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-light">Point of Sale</h1>
          <p className="text-text-secondary dark:text-text-light/80">
            Process in-store and call-in orders quickly with cart + customer in one view.
          </p>
        </div>
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
        >
          {fullscreen ? <FiMinimize /> : <FiMaximize />}
          <span className="hidden sm:inline">{fullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
        </button>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-5">
        <div className="rounded-xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-[var(--shadow-soft)] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-light">Products</h2>
            <button className="flex items-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-sm font-medium text-text-primary dark:text-text-light hover:bg-primary/10 transition-colors">
              <FiFilter /> Filter
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-white dark:bg-dark-card px-3 py-2 shadow-[var(--shadow-soft)]">
            <FiSearch className="text-text-secondary" />
            <input
              type="text"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search products or scan barcode"
              className="w-full bg-transparent outline-none text-text-primary dark:text-text-light placeholder:text-text-secondary"
            />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {loadingProducts && (
              <div className="sm:col-span-2 xl:col-span-3 text-center text-sm text-text-secondary py-6">
                Loading products...
              </div>
            )}
            {productError && !loadingProducts && (
              <div className="sm:col-span-2 xl:col-span-3 text-center text-sm text-rose-600 py-6">
                {productError}
              </div>
            )}
            {!loadingProducts &&
              !productError &&
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-lg border border-primary/10 bg-white dark:bg-dark-card p-3 shadow-[var(--shadow-soft)] hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setQuickViewProduct(product)}
                >
                  <div className="w-full h-32 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 mb-3 flex items-center justify-center p-2">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-xs font-semibold text-text-secondary">No image</div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-text-primary dark:text-text-light">
                      {product.name}
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-text-primary dark:text-text-light">
                    ${Number(product.salePrice || 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary dark:text-text-light/70">
                    Stock: {product.stock ?? 0}
                  </div>
                  <button
                    className="mt-3 w-full rounded-md bg-primary text-white py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // add to cart handler placeholder
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            {!loadingProducts && !productError && !filteredProducts.length && (
              <div className="sm:col-span-2 xl:col-span-3 text-center text-sm text-text-secondary py-6">
                No products match your filter.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-[var(--shadow-soft)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-light">Customers</h2>
              <button className="text-sm text-primary font-medium hover:underline">New customer</button>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-white dark:bg-dark-card px-3 py-2 shadow-[var(--shadow-soft)]">
              <FiSearch className="text-text-secondary" />
              <input
                type="text"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="Search customers (name, phone, type)"
                className="w-full bg-transparent outline-none text-text-primary dark:text-text-light placeholder:text-text-secondary"
              />
            </div>
            <div className="divide-y divide-primary/10 rounded-lg border border-primary/15 bg-white dark:bg-dark-card shadow-[var(--shadow-soft)]">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-text-primary dark:text-text-light truncate">
                      {customer.name}
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">
                      {customer.phone}
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {customer.type}
                  </span>
                </div>
              ))}
              {!filteredCustomers.length && (
                <div className="p-4 text-center text-sm text-text-secondary">No customers found.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-[var(--shadow-soft)] p-4 space-y-4">
            <div className="flex items-center gap-2 text-text-primary dark:text-text-light">
              <FiTruck /> <span className="font-semibold">Cart & Payment</span>
            </div>

            <div className="rounded-lg border border-primary/15 bg-white dark:bg-dark-card shadow-[var(--shadow-soft)] divide-y divide-primary/10">
              {demoCart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary dark:text-text-light truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded-md border border-primary/15 hover:bg-primary/10">
                      <FiMinus />
                    </button>
                    <span className="w-8 text-center font-semibold text-text-primary dark:text-text-light">
                      {item.qty}
                    </span>
                    <button className="p-1 rounded-md border border-primary/15 hover:bg-primary/10">
                      <FiPlus />
                    </button>
                  </div>
                  <div className="w-16 text-right font-semibold text-text-primary dark:text-text-light">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                  <button className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-sm text-text-secondary dark:text-text-light/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-text-primary dark:text-text-light">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (7%)</span>
                <span className="font-semibold text-text-primary dark:text-text-light">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-text-primary dark:text-text-light">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">
              <FiDollarSign /> Place Order (POS)
            </button>
          </div>
        </div>
      </div>
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </Container>
  );
}
