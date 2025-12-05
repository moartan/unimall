import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';
import customerAuthRoutes from './routes/customer/authRoutes.js';
import employeeAuthRoutes from './routes/employee/authRoutes.js';
import customerProfileRoutes from './routes/customer/profileRoutes.js';
import employeeProfileRoutes from './routes/employee/profileRoutes.js';
import customerSessionRoutes from './routes/customer/sessionRoutes.js';
import employeeSessionRoutes from './routes/employee/sessionRoutes.js';
import { csrfSkip, csrfErrorHandler } from './middleware/csrf.js';
import adminRoutes from './routes/employee/adminRoutes.js';
import customerAddressRoutes from './routes/customer/addressRoutes.js';
import customerNotificationRoutes from './routes/customer/notificationRoutes.js';
import employeeNotificationRoutes from './routes/employee/notificationRoutes.js';
import employeeCategoryRoutes from './routes/employee/categoryRoutes.js';
import employeeProductRoutes from './routes/employee/productRoutes.js';
import catalogProductRoutes from './routes/catalog/productRoutes.js';
import employeeMediaRoutes from './routes/employee/mediaRoutes.js';
import customerWishlistRoutes from './routes/customer/wishlistRoutes.js';
import customerCartRoutes from './routes/customer/cartRoutes.js';
import customerOrderRoutes from './routes/customer/orderRoutes.js';
import employeeOrderRoutes from './routes/employee/orderRoutes.js';
import catalogCategoryRoutes from './routes/catalog/categoryRoutes.js';

const app = express();

// --- Security ---
app.use(helmet());

// --- CORS CONFIG: allow Vercel + local dev ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://unimall-wine.vercel.app",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(cors(corsOptions));
// Short-circuit OPTIONS globally to avoid path-to-regexp issues in Express 5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(csrfSkip);

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/auth', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth/customer', customerAuthRoutes);
app.use('/auth/employee', employeeAuthRoutes);
app.use('/customer/profile', customerProfileRoutes);
app.use('/employee/profile', employeeProfileRoutes);
app.use('/customer/sessions', customerSessionRoutes);
app.use('/employee/sessions', employeeSessionRoutes);
app.use('/cpanel', adminRoutes);
app.use('/customer/addresses', customerAddressRoutes);
app.use('/customer/notifications', customerNotificationRoutes);
app.use('/employee/notifications', employeeNotificationRoutes);
app.use('/employee/categories', employeeCategoryRoutes);
app.use('/employee/products', employeeProductRoutes);
app.use('/catalog/products', catalogProductRoutes);
app.use('/catalog/categories', catalogCategoryRoutes);
app.use('/employee/media', employeeMediaRoutes);
app.use('/customer/wishlist', customerWishlistRoutes);
app.use('/customer/cart', customerCartRoutes);
app.use('/customer/orders', customerOrderRoutes);
app.use('/employee/orders', employeeOrderRoutes);

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

app.use(csrfErrorHandler);

// --- Render requires PORT from environment ---
const PORT = process.env.PORT || 5000;

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
