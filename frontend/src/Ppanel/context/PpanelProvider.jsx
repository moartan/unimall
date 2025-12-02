import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { baseClient, createApiClient } from '../../shared/api/client';

const PpanelContext = createContext({});

export default function PpanelProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);
  const refreshTimer = useRef(null);
  const isPpanelRoute =
    typeof window !== 'undefined' && !window.location.pathname.startsWith('/cpanel');

  const setToken = (token) => {
    tokenRef.current = token;
    setAccessToken(token || null);
  };

  const api = useMemo(
    () =>
      createApiClient({
        getAccessToken: () => tokenRef.current,
        refreshEndpoint: '/auth/customer/refresh',
        onRefresh: setToken,
      }),
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const refreshRes = await baseClient.post('/auth/customer/refresh', {});
      const token = refreshRes.data?.accessToken;
      if (token) {
        setToken(token);
        if (!user) {
          const profileRes = await api.get('/customer/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(profileRes.data?.user || null);
        }
      }
    } catch (err) {
      setToken(null);
    }
  }, [api, user]);

  useEffect(() => {
    if (!isPpanelRoute) {
      setLoading(false);
      return;
    }
    const bootstrap = async () => {
      try {
        const refreshRes = await baseClient.post('/auth/customer/refresh', {});
        const token = refreshRes.data?.accessToken;
        if (token) {
          setToken(token);
          const profileRes = await api.get('/customer/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(profileRes.data?.user || null);
        }
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [api, isPpanelRoute]);

  useEffect(() => {
    if (!isPpanelRoute) return undefined;
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
    refreshTimer.current = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000); // keep alive every 10 minutes
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refreshSession]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/auth/customer/login', { email, password });
      setUser(data.user);
      setToken(data.accessToken);
      return data.user;
    },
    [api],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/customer/logout');
    } catch (err) {
      // ignore logout failure to ensure client state clears
    }
    setUser(null);
    setToken(null);
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
  }, [api]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      accessToken,
      loading,
      login,
      logout,
      api,
      setToken,
    }),
    [user, accessToken, loading, login, logout, api, setToken],
  );

  return <PpanelContext.Provider value={value}>{children}</PpanelContext.Provider>;
}

export const usePpanel = () => useContext(PpanelContext);
