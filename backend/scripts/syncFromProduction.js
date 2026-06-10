import "../src/config/loadEnv.js";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import PromotionPackage from "../src/models/PromotionPackage.js";
import { connectToDatabase } from "../src/utils/db.js";

const SOURCE_API =
  process.env.SYNC_SOURCE_API ||
  "https://kite-backend-eux7.onrender.com/api";

async function fetchJson(path) {
  const res = await fetch(`${SOURCE_API}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function stripMongoId(doc) {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return rest;
}

async function syncCollection(Model, path, label) {
  const items = await fetchJson(path);
  if (!Array.isArray(items) || items.length === 0) {
    console.log(`No ${label} to sync.`);
    return 0;
  }

  const operations = items.map((item) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: stripMongoId(item) },
      upsert: true,
    },
  }));

  const result = await Model.bulkWrite(operations, { ordered: false });
  console.log(
    `${label}: synced ${items.length} (${result.upsertedCount} new, ${result.modifiedCount} updated)`,
  );
  return items.length;
}

async function main() {
  try {
    await connectToDatabase();
    console.log(`Syncing from ${SOURCE_API} ...`);
    await syncCollection(Product, "/products", "Products");
    await syncCollection(PromotionPackage, "/promotions", "Promotions");
    console.log("Sync complete.");
  } catch (error) {
    console.error("Sync failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();
