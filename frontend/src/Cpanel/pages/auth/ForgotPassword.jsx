import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCpanel } from '../../context/CpanelProvider';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { api } = useCpanel();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      await api.post('/auth/employee/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send reset email.';
      setStatus({ loading: false, error: message });
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
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
          shadow-theme border border-primary/10
          overflow-hidden transition-colors duration-300
        "
      >
        <div className="absolute top-0 left-0 w-full h-3 rounded-t-2xl bg-primary" />

        <h1 className="text-3xl font-extrabold text-center mb-6 text-primary">
          Forgot Password
        </h1>
        <p className="text-center text-text-secondary dark:text-text-light/70 text-sm mb-6">
          Enter your email address and we’ll send you instructions to reset your password.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {status.error ? (
              <div className="text-sm text-red-600 bg-red-100 rounded p-2 text-center">{status.error}</div>
            ) : null}

            <button
              type="submit"
              disabled={status.loading}
              className="
                w-full py-2 rounded-md font-semibold
                bg-primary hover:bg-primary-hover text-white
                shadow-theme transition disabled:opacity-70
              "
            >
              {status.loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => navigate('/cpanel/login')}
                className="text-sm text-primary hover:underline font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-6">
              ✅ Password reset link sent to <strong>{email}</strong>
            </p>
            <button
              type="button"
              onClick={() => navigate('/cpanel/login')}
              className="px-6 py-2 rounded-md font-semibold bg-primary hover:bg-primary-hover text-white transition"
            >
              Return to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
