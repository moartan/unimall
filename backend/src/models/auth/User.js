import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const USER_ROLES = ['customer', 'employee'];
const EMPLOYEE_ROLES = ['admin', 'staff'];
const AUTH_PROVIDERS = ['local', 'google', 'facebook', 'apple'];
const GENDER = ['male', 'female'];
const STATUS = ['active', 'block'];

const generateUserCode = (role) => {
  const prefix = role === 'employee' ? 'EMP' : 'CUS';
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${random}`;
};

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: USER_ROLES, required: true },
    employeeRole: { type: String, enum: EMPLOYEE_ROLES },
    provider: { type: String, enum: AUTH_PROVIDERS, default: 'local' },
    email: { type: String, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    smsVerified: { type: Boolean, default: false }, // reserved for future SMS verification
    password: { type: String },
    name: { type: String, trim: true },
    gender: { type: String, enum: GENDER, trim: true },
    country: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String, trim: true },
    avatarPublicId: { type: String, trim: true },
    providerId: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    userCode: { type: String, unique: true },
    status: { type: String, enum: STATUS, default: 'active' },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre('validate', function setUserCode() {
  if (!this.userCode) {
    this.userCode = generateUserCode(this.role);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
