import { Navigate, useLocation } from 'react-router-dom';
import { usePpanel } from '../context/PpanelProvider.jsx';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const PUBLIC_PREFIXES = ['/', '/products', '/checkout'];

export default function ProtectedPpanel({ children }) {
  const location = useLocation();
  const { user, loading } = usePpanel();

  const path = location.pathname || '/';
  const isResetPassword = path.startsWith('/reset-password');
  const isPublicPath =
    PUBLIC_PATHS.includes(path) ||
    isResetPassword ||
    PUBLIC_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  if (isPublicPath) return children;
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
  return children;
}
