import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: Date.now },
    metadata: { type: Object },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);
