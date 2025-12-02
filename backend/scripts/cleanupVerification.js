import mongoose from 'mongoose';
import config from '../src/config/env.js';
import User from '../src/models/auth/User.js';

/**
 * One-time cleanup script to drop deprecated verification flags.
 * Usage: node scripts/cleanupVerification.js
 */
const run = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    const result = await User.updateMany({}, { $unset: { isVerified: '', isVerify: '' } });
    console.log(`Updated ${result.modifiedCount} users (removed isVerified/isVerify)`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
};

run();
