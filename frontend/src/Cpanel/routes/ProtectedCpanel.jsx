import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCpanel } from '../context/CpanelProvider';

export default function ProtectedCpanel() {
  const location = useLocation();
  const { user, loading } = useCpanel();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary font-semibold">
        Checking your admin session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/cpanel/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
