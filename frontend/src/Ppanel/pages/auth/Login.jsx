import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePpanel } from '../../context/PpanelProvider.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading } = usePpanel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === 'string') return fromState === '/login' ? '/' : fromState;
    if (fromState?.pathname && fromState.pathname !== '/login') {
      // include search/hash if present
      const search = fromState.search || '';
      const hash = fromState.hash || '';
      return `${fromState.pathname}${search}${hash}`;
    }
    return '/';
  }, [location.state]);

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, redirectPath]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] bg-light-bg dark:bg-dark-bg transition-colors duration-300 px-4 pt-12 md:pt-16 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 md:p-10 rounded-2xl bg-light-card dark:bg-dark-card shadow-soft border border-primary/10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 rounded-t-2xl bg-primary" />

        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-8 tracking-tight mt-2 text-primary">
          Uni<span className="text-text-primary dark:text-text-light">Mall</span>{' '}
          <span className="text-text-secondary dark:text-text-light/70">Account</span>
        </h1>

        {error ? (
          <div className="mb-4 text-red-600 bg-red-100 dark:bg-red-900/40 rounded p-2 text-sm text-center">
            {error}
          </div>
        ) : null}

        {/* Social */}
        <div className="space-y-3 mb-4">
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition">
            <i className="fab fa-facebook text-lg"></i> Continue with Facebook
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-gray-900 hover:bg-gray-800 transition">
            <i className="fab fa-apple text-lg"></i> Continue with Apple
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-red-500 hover:bg-red-600 transition">
            <i className="fab fa-google text-lg"></i> Continue with Google
          </button>
        </div>
        <div className="relative flex items-center justify-center mb-4">
          <div className="h-0.5 w-full bg-gray-300 dark:bg-gray-700"></div>
          <span className="absolute bg-light-card dark:bg-dark-card px-2 text-sm text-gray-500">or login with email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1 text-sm text-text-primary dark:text-text-light">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-md px-4 py-2 text-[15px] bg-light-bg dark:bg-dark-bg border border-primary/20 text-text-primary dark:text-text-light placeholder-text-secondary/70 dark:placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-sm text-text-primary dark:text-text-light">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-md px-4 py-2 text-[15px] bg-light-bg dark:bg-dark-bg border border-primary/20 text-text-primary dark:text-text-light placeholder-text-secondary/70 dark:placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-md font-semibold bg-primary hover:bg-primary-hover text-white shadow-soft transition disabled:opacity-70"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Don’t have an account? Register
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
