import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../src/config/env.js';
import User from '../src/models/auth/User.js';

const seed = async () => {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@unimall.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123!';
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const user = await User.create({
    email,
    password,
    name,
    role: 'employee',
    employeeRole: 'admin',
    provider: 'local',
    emailVerified: true,
    isVerified: true,
    isVerify: true,
    status: 'active',
  });

  console.log('Seeded admin:', {
    email: user.email,
    employeeRole: user.employeeRole,
    password,
  });
};

const run = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    await seed();
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
};

run();
