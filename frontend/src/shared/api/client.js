import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const createApiClient = ({ getAccessToken, refreshEndpoint, onRefresh }) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken?.();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      const url = originalRequest.url || '';
      const isAuthPath =
        url.includes('/login') ||
        url.includes('/forgot-password') ||
        url.includes('/reset-password') ||
        url.includes('/logout') ||
        url.includes('/refresh');

      if (error.response?.status === 401 && refreshEndpoint && !isAuthPath) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}${refreshEndpoint}`,
            {},
            { withCredentials: true },
          );
          const newAccessToken = refreshResponse.data?.accessToken;
          if (newAccessToken && onRefresh) {
            onRefresh(newAccessToken);
          }
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          };
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export const baseClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
