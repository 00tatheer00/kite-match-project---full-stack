import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  defaultShippingCost: { type: Number, default: 150 },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
