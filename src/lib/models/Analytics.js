import mongoose from 'mongoose';

const VisitItemSchema = new mongoose.Schema({
  id: String,
  timestamp: String,
  path: String,
  source: String,
  device: String,
  city: String,
  country: String,
  ip: String,
}, { _id: false });

const AnalyticsSchema = new mongoose.Schema({
  key: { type: String, default: 'global_summary', unique: true },
  totalVisitors: { type: Number, default: 0 },
  todayVisitors: { type: Number, default: 0 },
  totalPageviews: { type: Number, default: 0 },
  sources: { type: Object, default: {} },
  devices: { type: Object, default: {} },
  cities: { type: Object, default: {} },
  countries: { type: Object, default: {} },
  topPages: { type: Object, default: {} },
  recentVisits: [VisitItemSchema],
  lastUpdated: { type: String, default: () => new Date().toISOString() },
}, { timestamps: true, minimize: false });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
