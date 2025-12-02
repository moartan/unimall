import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePpanel } from '../context/PpanelProvider.jsx';

export default function PublicPpanel() {
  const { user, loading } = usePpanel();
  const location = useLocation();

  if (loading) return null;
  if (user) return <Navigate to="/" state={{ from: location }} replace />;
  return <Outlet />;
}
