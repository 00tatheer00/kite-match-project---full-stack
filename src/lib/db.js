import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastFailedAt: 0 };
}

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    ""
  );
}

export async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const rawUri = getMongoUri();
  const mongoUri = rawUri || "mongodb://127.0.0.1:27017/kite";

  // In production (e.g. Vercel) without a custom MongoDB URI, fail fast to remote fallback
  if (!rawUri && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
    throw new Error("MONGODB_URI not configured in production environment.");
  }

  // If last connection failed less than 20 seconds ago, fail fast so API routes don't delay
  if (cached.lastFailedAt && Date.now() - cached.lastFailedAt < 20000) {
    throw new Error("Database connection in cooldown after recent failure.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      })
      .then((m) => {
        cached.lastFailedAt = 0;
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    cached.lastFailedAt = Date.now();
    throw e;
  }
}

