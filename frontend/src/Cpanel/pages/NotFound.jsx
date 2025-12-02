import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[75vh] bg-light-bg dark:bg-dark-bg transition-colors duration-300 px-4 pt-12 md:pt-16 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center"
      >
        <div className="text-6xl md:text-7xl font-black text-primary mb-3">404</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary dark:text-text-light mb-3">
          Page Not Found
        </h1>
        <p className="text-base text-text-secondary dark:text-text-light/70 mb-8 max-w-xl mx-auto">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <Link
          to="/cpanel/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-[var(--shadow-soft)] transition"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
