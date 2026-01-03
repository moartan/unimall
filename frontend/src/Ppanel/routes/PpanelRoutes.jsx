import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Home from '../pages/home/Home.jsx';
import Products from '../pages/products/Products.jsx';
import Login from '../pages/auth/Login.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import Register from '../pages/auth/Register.jsx';
import VerifyEmail from '../pages/auth/VerifyEmail.jsx';
import ConfirmEmailChange from '../pages/auth/ConfirmEmailChange.jsx';
import Checkout from '../pages/checkout/Checkout.jsx';
import Profile from '../pages/profile/Profile.jsx';
import ProfileAddressesPage from '../pages/profile/ProfileAddressesPage.jsx';
import ProfileOrdersPage from '../pages/profile/ProfileOrdersPage.jsx';
import Wishlist from '../pages/wishlist/Wishlist.jsx';
import NotFound from '../pages/NotFound.jsx';
import PublicPpanel from './PublicPpanel.jsx';
import ProtectedPpanel from './ProtectedPpanel.jsx';
import ProductDetails from '../pages/products/details/ProductDetails.jsx';
import About from '../pages/about/About.jsx';
import Contact from '../pages/contact/Contact.jsx';
import Support from '../pages/support/Support.jsx';

const LegacyDetailsRedirect = () => {
  const { slugOrId } = useParams();
  return <Navigate to={`/collections/view/${slugOrId}`} replace />;
};

export default function PpanelRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="products" element={<Products />} />
      <Route path="products/details/:slugOrId" element={<LegacyDetailsRedirect />} />

      <Route path="collections" element={<Products />} />
      <Route path="collections/view/:slugOrId" element={<ProductDetails />} />
      <Route path="collections/:maybeFeatured" element={<Products />} />
      <Route path="collections/:maybeFeatured/:categorySlug" element={<Products />} />

      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="support" element={<Support />} />

      <Route element={<PublicPpanel />}>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="register" element={<Register />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="confirm-email-change" element={<ConfirmEmailChange />} />
      </Route>

      <Route path="checkout" element={<Checkout />} />
      <Route
        path="profile"
        element={
          <ProtectedPpanel>
            <Profile />
          </ProtectedPpanel>
        }
      />
      <Route
        path="addresses"
        element={
          <ProtectedPpanel>
            <ProfileAddressesPage />
          </ProtectedPpanel>
        }
      />
      <Route
        path="profile/orders"
        element={
          <ProtectedPpanel>
            <ProfileOrdersPage />
          </ProtectedPpanel>
        }
      />
      <Route
        path="orders"
        element={
          <ProtectedPpanel>
            <ProfileOrdersPage />
          </ProtectedPpanel>
        }
      />
      <Route
        path="wishlist"
        element={
          <ProtectedPpanel>
            <Wishlist />
          </ProtectedPpanel>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
