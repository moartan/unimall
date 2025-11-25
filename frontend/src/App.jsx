import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Ppanel/components/Layout';
import CpanelLayout from './Cpanel/components/Layout';
import PpanelRoutes from './Ppanel/routes/PpanelRoutes';
import CpanelRoutes from './Cpanel/routes/CpanelRoutes';
import ProtectedPpanel from './Ppanel/routes/ProtectedPpanel';
import ProtectedCpanel from './Cpanel/routes/ProtectedCpanel';

function App() {
  return (
    <Routes>
      <Route
        path="/cpanel/*"
        element={
          <ProtectedCpanel>
            <CpanelLayout>
              <CpanelRoutes />
            </CpanelLayout>
          </ProtectedCpanel>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedPpanel>
            <Layout>
              <PpanelRoutes />
            </Layout>
          </ProtectedPpanel>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
