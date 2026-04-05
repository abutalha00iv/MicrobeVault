import { createHash } from "node:crypto";

function parseCloudinaryUrl() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    throw new Error("CLOUDINARY_URL is not configured.");
  }

  const url = new URL(cloudinaryUrl);
  const cloudName = url.hostname;
  const apiKey = url.username;
  const apiSecret = url.password;

  return { cloudName, apiKey, apiSecret };
}

export async function uploadToCloudinary(file: File, folder = "microbevault") {
  const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl();
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", folder);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  return response.json();
}

