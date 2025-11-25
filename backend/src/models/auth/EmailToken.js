import mongoose from 'mongoose';

const emailTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    type: { type: String, enum: ['verify', 'change', 'reset'], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

emailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('EmailToken', emailTokenSchema);
