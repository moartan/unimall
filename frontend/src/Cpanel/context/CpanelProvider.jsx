import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { baseClient, createApiClient } from '../../shared/api/client';

const CpanelContext = createContext({});
const SESSION_FLAG_KEY = 'unimall_employee_session';

const hasSessionFlag = () =>
  typeof window !== 'undefined' && window.localStorage.getItem(SESSION_FLAG_KEY) === '1';

const setSessionFlag = (value) => {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(SESSION_FLAG_KEY, '1');
  } else {
    window.localStorage.removeItem(SESSION_FLAG_KEY);
  }
};

export default function CpanelProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);
  const refreshTimer = useRef(null);
  const isCpanelRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/cpanel');
  const csrfRef = useRef(null);

  const setToken = (token) => {
    tokenRef.current = token;
    setAccessToken(token || null);
    setSessionFlag(Boolean(token));
  };

  const api = useMemo(
    () =>
      createApiClient({
        getAccessToken: () => tokenRef.current,
        refreshEndpoint: '/auth/employee/refresh',
        onRefresh: setToken,
      }),
    [],
  );

  const refreshSession = useCallback(async () => {
    if (!hasSessionFlag()) return;
    try {
      if (!csrfRef.current) {
        const res = await baseClient.get('/csrf-token');
        csrfRef.current = res.data?.csrfToken;
        if (csrfRef.current) {
          api.defaults.headers.common['X-CSRF-Token'] = csrfRef.current;
          baseClient.defaults.headers.common['X-CSRF-Token'] = csrfRef.current;
        }
      }
      const refreshRes = await baseClient.post('/auth/employee/refresh', {});
      const token = refreshRes.data?.accessToken;
      if (token) {
        setToken(token);
        if (!user) {
          const profileRes = await api.get('/employee/profile', {
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
    if (!isCpanelRoute) {
      setLoading(false);
      return;
    }
    const ensureCsrf = async () => {
      try {
        if (!csrfRef.current) {
          const res = await baseClient.get('/csrf-token');
          csrfRef.current = res.data?.csrfToken;
          if (csrfRef.current) {
            api.defaults.headers.common['X-CSRF-Token'] = csrfRef.current;
            baseClient.defaults.headers.common['X-CSRF-Token'] = csrfRef.current;
          }
        }
      } catch (_err) {
        // if csrf fetch fails, subsequent requests will surface errors
      }
    };
    const bootstrap = async () => {
      try {
        await ensureCsrf();
        if (!hasSessionFlag()) {
          setLoading(false);
          return;
        }
        const refreshRes = await baseClient.post('/auth/employee/refresh', {});
        const token = refreshRes.data?.accessToken;
        if (token) {
          setToken(token);
          const profileRes = await api.get('/employee/profile', {
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
  }, [api, isCpanelRoute]);

  useEffect(() => {
    if (!isCpanelRoute) return undefined;
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
      const { data } = await api.post('/auth/employee/login', { email, password });
      setUser(data.user);
      setToken(data.accessToken);
      setSessionFlag(true);
      return data.user;
    },
    [api],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/employee/logout');
    } catch (err) {
      // ignore logout failure to ensure client state clears
    }
    setUser(null);
    setToken(null);
    setSessionFlag(false);
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
  }, [api]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      accessToken,
      loading,
      api,
    }),
    [user, login, logout, accessToken, loading, api],
  );
  return <CpanelContext.Provider value={value}>{children}</CpanelContext.Provider>;
}

export const useCpanel = () => useContext(CpanelContext);
export { CpanelContext };
