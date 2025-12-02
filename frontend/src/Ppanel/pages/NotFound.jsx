import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[75vh] bg-light-bg dark:bg-dark-bg transition-colors duration-300 px-4 pt-12 md:pt-16 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-lg p-8 md:p-10 rounded-2xl bg-light-card dark:bg-dark-card shadow-soft border border-primary/10 overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 w-full h-3 rounded-t-2xl bg-primary" />

        <div className="text-6xl md:text-7xl font-black text-primary mb-3">404</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary dark:text-text-light mb-3">
          Page Not Found
        </h1>
        <p className="text-base text-text-secondary dark:text-text-light/70 mb-8 max-w-xl mx-auto">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="flex flex-col items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-[var(--shadow-soft)] transition"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
