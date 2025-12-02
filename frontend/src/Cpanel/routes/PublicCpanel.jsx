import { Navigate, Outlet } from 'react-router-dom';
import { useCpanel } from '../context/CpanelProvider';

export default function PublicCpanel() {
  const { user, loading } = useCpanel();
  if (loading) return null;
  if (user) return <Navigate to="/cpanel/dashboard" replace />;
  return <Outlet />;
}
