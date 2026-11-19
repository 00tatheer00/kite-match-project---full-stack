import mongoose from "mongoose";

// Disable command buffering so disconnected queries fail fast immediately without 10s timeout
mongoose.set('bufferCommands', false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastFailedAt: 0 };
}

function getMongoUri() {
  const uri = (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    ""
  ).trim();

  // If in Vercel production and the URI points to localhost, do not use it
  if (process.env.VERCEL && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
    return "";
  }

  return uri;
}

export async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const rawUri = getMongoUri();

  // Graceful fallback: If MongoDB URI is not configured, return null without crashing
  if (!rawUri) {
    return null;
  }

  // Cooldown check after recent failure to avoid serverless timeout delays
  if (cached.lastFailedAt && Date.now() - cached.lastFailedAt < 15000) {
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(rawUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      })
      .then((m) => {
        cached.lastFailedAt = 0;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        cached.lastFailedAt = Date.now();
        console.warn("MongoDB connection deferred:", err.message);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    cached.lastFailedAt = Date.now();
    return null;
  }
}
