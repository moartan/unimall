import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Ppanel/components/Layout';
import PpanelRoutes from './Ppanel/routes/PpanelRoutes';
import CpanelRoutes from './Cpanel/routes/CpanelRoutes';
import ProtectedPpanel from './Ppanel/routes/ProtectedPpanel';

function App() {
  return (
    <Routes>
      <Route path="/cpanel/*" element={<CpanelRoutes />} />
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
    </Routes>
  );
}

export default App;
