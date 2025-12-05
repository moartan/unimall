import CpanelProvider from '../Cpanel/context/CpanelProvider.jsx';
import PpanelProvider from '../Ppanel/context/PpanelProvider.jsx';
import { CartProvider } from '../Ppanel/context/useCart.jsx';
import WishlistProvider from '../Ppanel/context/WishlistContext.jsx';

export default function AppProviders({ children }) {
  return (
    <CpanelProvider>
      <PpanelProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </PpanelProvider>
    </CpanelProvider>
  );
}
