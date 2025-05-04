// models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  mfaSecret: String,  // Store the secret key for TOTP here
  mfaEnabled: { type: Boolean, default: false }, 
});

export default mongoose.models.User || mongoose.model('User', userSchema);
