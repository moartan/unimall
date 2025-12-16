import { useEffect } from 'react';

export default function useCanonical(pathname = '/') {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const href = `${window.location.origin}${path}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [pathname]);
}
