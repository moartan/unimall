import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Products from '../pages/products/Products.jsx';
import Invoices from '../pages/invoices/Invoices.jsx';
import Auth from '../pages/auth/Auth.jsx';
import Profile from '../pages/profile/Profile.jsx';
import Users from '../pages/users/Users.jsx';
import Orders from '../pages/orders/Orders.jsx';
import Categories from '../pages/categories/Categories.jsx';

export default function CpanelRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="auth" element={<Auth />} />
      <Route path="profile" element={<Profile />} />
      <Route path="users" element={<Users />} />
      <Route path="orders" element={<Orders />} />
      <Route path="categories" element={<Categories />} />
      <Route path="*" element={<Navigate to="/cpanel" replace />} />
    </Routes>
  );
}
