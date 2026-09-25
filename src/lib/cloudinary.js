import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

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
  if (!isConfigured) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to environment variables.",
    );
  }

  const optimizedFile = await optimizeImageFileToWebp(file);
  const folder = options.folder || "kite/products";
  const filename = String(optimizedFile.originalname || "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp",
        public_id: filename ? `${Date.now()}-${filename}` : undefined,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url || "");
      },
    );

    uploadStream.end(optimizedFile.buffer);
  });
}
