import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home.jsx';
import Products from '../pages/products/Products.jsx';
import Auth from '../pages/auth/Auth.jsx';
import Checkout from '../pages/checkout/Checkout.jsx';
import Profile from '../pages/profile/Profile.jsx';
import Orders from '../pages/orders/Orders.jsx';
import Wishlist from '../pages/wishlist/Wishlist.jsx';

export default function PpanelRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="products" element={<Products />} />
      <Route path="auth" element={<Auth />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="profile" element={<Profile />} />
      <Route path="orders" element={<Orders />} />
      <Route path="wishlist" element={<Wishlist />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
