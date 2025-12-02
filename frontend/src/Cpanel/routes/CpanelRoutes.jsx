import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import Products from '../pages/products/Products';
import ProductList from '../pages/products/ProductList';
import AddProduct from '../pages/products/AddProduct';
import Categories from '../pages/categories/Categories';
import CategoryList from '../pages/categories/CategoryList';
import AddCategory from '../pages/categories/AddCategory';
import Orders from '../pages/orders/Orders';
import Invoices from '../pages/invoices/Invoices';
import Users from '../pages/users/Users';
import CustomerList from '../pages/users/CustomerList';
import EmployeeList from '../pages/users/EmployeeList';
import AddEmployee from '../pages/users/AddEmployee';
import NotFound from '../pages/NotFound';
import ProtectedCpanel from './ProtectedCpanel';
import PublicCpanel from './PublicCpanel';

export default function CpanelRoutes() {
  return (
    <Routes>
      <Route element={<PublicCpanel />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedCpanel />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile/*" element={<Profile />} />
          <Route path="products" element={<Navigate to="products/list" replace />} />
          <Route path="products/list" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/*" element={<Products />} />
          <Route path="categories" element={<Navigate to="categories/list" replace />} />
          <Route path="categories/list" element={<CategoryList />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/*" element={<Categories />} />
          <Route path="orders/*" element={<Orders />} />
          <Route path="invoices/*" element={<Invoices />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="employees/list" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="users/*" element={<Users />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
