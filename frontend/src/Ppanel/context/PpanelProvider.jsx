import { createContext, useContext, useMemo, useState } from 'react';

const PpanelContext = createContext({});

export default function PpanelProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <PpanelContext.Provider value={value}>{children}</PpanelContext.Provider>;
}

export const usePpanel = () => useContext(PpanelContext);
