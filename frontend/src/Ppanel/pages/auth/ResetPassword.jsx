import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePpanel } from '../../context/PpanelProvider.jsx';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { api } = usePpanel();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/customer/reset-password', { token, newPassword: password });
      setSubmitted(true);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to reset password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] bg-light-bg dark:bg-dark-bg transition-colors duration-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 md:p-10 rounded-2xl bg-light-card dark:bg-dark-card shadow-soft border border-primary/10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 rounded-t-2xl bg-primary" />

        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 text-primary">Reset Password</h1>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-semibold mb-1 text-sm text-text-primary dark:text-text-light">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
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
                placeholder="Confirm new password"
                className="w-full rounded-md px-4 py-2 text-[15px] bg-light-bg dark:bg-dark-bg border border-primary/20 text-text-primary dark:text-text-light focus:outline-none focus:ring-2 focus:ring-primary transition"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-center text-red-500 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md font-semibold bg-primary hover:bg-primary-hover text-white shadow-soft transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-6">✅ Your password has been successfully reset!</p>
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="px-6 py-2 rounded-md font-semibold bg-primary hover:bg-primary-hover text-white transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
