import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePpanel } from '../../context/PpanelProvider.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { api, setUser, setToken, user, loading: authLoading, ensureCsrf } = usePpanel();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/customer/register', {
        name,
        email,
        password,
      });
      if (data?.user && data?.accessToken) {
        await ensureCsrf();
        setUser(data.user);
        setToken(data.accessToken);
        setSuccess('Account created! Redirecting...');
        navigate('/', { replace: true });
      } else {
        navigate('/login');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed.';
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

        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 text-primary">
          Create Account
        </h1>
        <p className="text-center text-text-secondary dark:text-text-light/70 text-sm mb-6">
          Set up your credentials to start using UniMall.
        </p>

        {error ? (
          <div className="mb-3 text-red-600 bg-red-100 dark:bg-red-900/40 rounded p-2 text-sm text-center">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-3 text-green-600 bg-green-100 dark:bg-green-900/40 rounded p-2 text-sm text-center">
            {success}
          </div>
        ) : null}

        {/* Social */}
        <div className="space-y-3 mb-4">
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition">
            <i className="fab fa-facebook text-lg"></i> Sign up with Facebook
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-gray-900 hover:bg-gray-800 transition">
            <i className="fab fa-apple text-lg"></i> Sign up with Apple
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md font-semibold text-white bg-red-500 hover:bg-red-600 transition">
            <i className="fab fa-google text-lg"></i> Sign up with Google
          </button>
        </div>
        <div className="relative flex items-center justify-center mb-4">
          <div className="h-0.5 w-full bg-gray-300 dark:bg-gray-700"></div>
          <span className="absolute bg-light-card dark:bg-dark-card px-2 text-sm text-gray-500">or register with email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1 text-sm text-text-primary dark:text-text-light">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-md px-4 py-2 text-[15px] bg-light-bg dark:bg-dark-bg border border-primary/20 text-text-primary dark:text-text-light placeholder-text-secondary/70 dark:placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              className="w-full rounded-md px-4 py-2 text-[15px] bg-light-bg dark:bg-dark-bg border border-primary/20 text-text-primary dark:text-text-light focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-sm text-text-primary dark:text-text-light">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-md px-4 py-2 text-[15px] bg-light-bg dark:bg-dark-bg border border-primary/20 text-text-primary dark:text-text-light focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-md font-semibold bg-primary hover:bg-primary-hover text-white shadow-soft transition disabled:opacity-70"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Already have an account? Login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
