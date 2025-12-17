import { useLocation } from 'react-router-dom';
import CpanelProvider from '../Cpanel/context/CpanelProvider.jsx';
import PpanelProvider from '../Ppanel/context/PpanelProvider.jsx';
import { CartProvider } from '../Ppanel/context/useCart.jsx';
import WishlistProvider from '../Ppanel/context/WishlistContext.jsx';

export default function AppProviders({ children }) {
  const location = useLocation();
  const isCpanel = location.pathname.startsWith('/cpanel');

  if (isCpanel) {
    return <CpanelProvider>{children}</CpanelProvider>;
  }

  // Public/customer side only mounts the Ppanel + commerce providers.
  return (
    <PpanelProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </PpanelProvider>
  );
}
