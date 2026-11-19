import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  defaultShippingCost: { type: Number, default: 200 },
  smallPackageShippingCost: { type: Number, default: 200 },
  freeShippingBundleIds: {
    type: [String],
    default: ['pkg-glow-family-pack', 'pkg-glow-bachat-mega', 'pkg-vero-family-pack'],
  },
  bannerType: { type: String, default: 'video' }, // 'image' or 'video'
  bannerImage: { type: String, default: '' },
  bannerMobileImage: { type: String, default: '' },
  bannerTitle: { type: String, default: 'Kite Brand Pakistan' },
  bannerLink: { type: String, default: '/online-order' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
