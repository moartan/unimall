import { Navigate, useLocation } from 'react-router-dom';
import { usePpanel } from '../context/PpanelProvider.jsx';

const PROTECTED_PREFIXES = ['/profile', '/orders', '/wishlist', '/checkout'];

export default function ProtectedPpanel({ children }) {
  const location = useLocation();
  const { user, loading } = usePpanel();

  const path = location.pathname || '/';
  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (requiresAuth) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-primary font-semibold">
          Checking your session...
        </div>
      );
    }
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}
