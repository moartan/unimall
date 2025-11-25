import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: Object },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
