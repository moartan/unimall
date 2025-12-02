import CpanelProvider from '../Cpanel/context/CpanelProvider.jsx';
import PpanelProvider from '../Ppanel/context/PpanelProvider.jsx';
import { CartProvider } from '../Ppanel/context/useCart.jsx';

export default function AppProviders({ children }) {
  return (
    <CpanelProvider>
      <CartProvider>
        <PpanelProvider>{children}</PpanelProvider>
      </CartProvider>
    </CpanelProvider>
  );
}
