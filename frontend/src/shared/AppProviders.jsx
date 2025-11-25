import CpanelProvider from '../Cpanel/context/CpanelProvider.jsx';
import PpanelProvider from '../Ppanel/context/PpanelProvider.jsx';

export default function AppProviders({ children }) {
  return (
    <CpanelProvider>
      <PpanelProvider>{children}</PpanelProvider>
    </CpanelProvider>
  );
}
