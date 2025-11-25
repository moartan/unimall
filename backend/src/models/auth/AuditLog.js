import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
