import { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CpanelContext } from '../../context/CpanelProvider';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(CpanelContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === 'string') return fromState === '/cpanel/login' ? '/cpanel/dashboard' : fromState;
    if (fromState?.pathname && fromState.pathname !== '/cpanel/login') {
      const search = fromState.search || '';
      const hash = fromState.hash || '';
      return `${fromState.pathname}${search}${hash}`;
    }
    return '/cpanel/dashboard';
  }, [location.state]);

  useEffect(() => {
    // If already logged in and redirected here, bounce to target
    if (location.state?.skipAutoNav) return;
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (login) {
        await login(email, password);
      }
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          relative w-full max-w-md p-10 rounded-2xl
          bg-light-card dark:bg-dark-card
          shadow-soft border border-primary/10
          overflow-hidden transition-colors duration-300
        "
      >
        <div className="absolute top-0 left-0 w-full h-3 rounded-t-2xl bg-primary" />

        <h1 className="text-3xl font-extrabold text-center mb-8 tracking-tight mt-2 text-primary">
          Uni<span className="text-text-primary dark:text-text-light">Mall</span>{' '}
          <span className="text-text-secondary dark:text-text-light/70">Control</span>{' '}
          <span className="text-primary/90">Panel</span>
        </h1>

        {error ? (
          <div className="mb-4 text-red-600 bg-red-100 dark:bg-red-900/40 rounded p-2 text-sm text-center">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1 text-sm text-text-primary dark:text-text-light">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@unimall.com"
              className="
                w-full rounded-md px-4 py-2 text-[15px]
                bg-light-bg dark:bg-dark-bg
                border border-primary/20
                text-text-primary dark:text-text-light
                placeholder-text-secondary/70 dark:placeholder-text-light/50
                focus:outline-none focus:ring-2 focus:ring-primary
                transition
              "
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
              className="
                w-full rounded-md px-4 py-2 text-[15px]
                bg-light-bg dark:bg-dark-bg
                border border-primary/20
                text-text-primary dark:text-text-light
                placeholder-text-secondary/70 dark:placeholder-text-light/50
                focus:outline-none focus:ring-2 focus:ring-primary
                transition
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-2 rounded-md font-semibold
              bg-primary hover:bg-primary-hover text-white
              shadow-soft transition disabled:opacity-70
            "
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => navigate('/cpanel/forgot-password')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
