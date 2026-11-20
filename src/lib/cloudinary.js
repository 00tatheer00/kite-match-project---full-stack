import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured, supabaseUrl } from "./supabase";

const CLOUDINARY_CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const CLOUDINARY_API_KEY = (process.env.CLOUDINARY_API_KEY || "").trim();
const CLOUDINARY_API_SECRET = (process.env.CLOUDINARY_API_SECRET || "").trim();

const isConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

export function isCloudinaryConfigured() {
  return isConfigured;
}

async function getBufferAndName(file) {
  if (file && typeof file.arrayBuffer === "function") {
    const ab = await file.arrayBuffer();
    return {
      buffer: Buffer.from(ab),
      originalname: file.name || "image",
    };
  }

  if (file?.buffer && Buffer.isBuffer(file.buffer)) {
    return {
      buffer: file.buffer,
      originalname: file.originalname || "image",
    };
  }

  if (Buffer.isBuffer(file)) {
    return {
      buffer: file,
      originalname: "image",
    };
  }

  throw new Error("Invalid image file buffer or file object.");
}

async function optimizeImageFileToWebp(fileInput) {
  const { buffer, originalname } = await getBufferAndName(fileInput);

  try {
    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: 640,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toBuffer();

    const optimizedName = String(originalname || "image")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();

    return {
      buffer: optimizedBuffer,
      originalname: `${optimizedName || "image"}.webp`,
    };
  } catch (err) {
    console.error("Failed to optimize image with sharp:", err);
    throw new Error("Failed to optimize uploaded image.");
  }
}

export async function uploadImageBuffer(file, options = {}) {
  const optimizedFile = await optimizeImageFileToWebp(file);
  const folder = options.folder || "kite/products";
  const filename = String(optimizedFile.originalname || "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const uniqueName = `${Date.now()}-${filename}.webp`;

  // Priority 1: Supabase Storage
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const storagePath = `${folder.replace(/[^a-zA-Z0-9-_/]/g, "")}/${uniqueName}`;
        const { error: uploadError } = await sb.storage
          .from("kite-images")
          .upload(storagePath, optimizedFile.buffer, {
            contentType: "image/webp",
            upsert: true,
          });
        if (!uploadError) {
          const { data: urlData } = sb.storage
            .from("kite-images")
            .getPublicUrl(storagePath);
          if (urlData?.publicUrl) {
            return urlData.publicUrl;
          }
        } else {
          console.warn("Supabase Storage upload failed:", uploadError.message);
        }
      }
    } catch (sbErr) {
      console.warn("Supabase Storage error:", sbErr.message);
    }
  }

  // Priority 2: Cloudinary
  if (isConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          format: "webp",
          public_id: `${Date.now()}-${filename}`,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result?.secure_url || "");
        },
      );
      uploadStream.end(optimizedFile.buffer);
    });
  }

  // Priority 3: Local filesystem
  try {
    const folderSanitized = folder.replace(/[^a-zA-Z0-9-_/]/g, "");
    const publicDir = path.join(process.cwd(), "public", "uploads", folderSanitized);
    fs.mkdirSync(publicDir, { recursive: true });
    const targetPath = path.join(publicDir, uniqueName);
    fs.writeFileSync(targetPath, optimizedFile.buffer);
    return `/uploads/${folderSanitized}/${uniqueName}`;
  } catch (localErr) {
    console.warn("Could not save to local filesystem, returning data URI:", localErr.message);
    return `data:image/webp;base64,${optimizedFile.buffer.toString("base64")}`;
  }
}
