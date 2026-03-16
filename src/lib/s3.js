import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Ensure keys from user prompt
const ACCESS_ID = "b6aae57565cde6c3aa4574fca0f871f2";
const ACCESS_KEY = "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836";
const ENDPOINT = "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3";
const REGION = "us-east-1"; // Region can be generic for Supabase S3
const BUCKET_NAME = "images";
const SUPABASE_PROJECT_URL = "https://vnnkhcqswoeqnghztpvh.supabase.co"; // To form public URL

const s3Client = new S3Client({
  forcePathStyle: true,
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_ID,
    secretAccessKey: ACCESS_KEY,
  },
});

export const uploadToSupabaseStorage = async ({ file, keyPrefix }) => {
  if (!file) throw new Error("file required");
  const safePrefix = String(keyPrefix || "").replace(/^\/+/, "").replace(/\/+$/, "");
  const fileExt = (file.name || "bin").split(".").pop();
  const base = file.name ? file.name.replace(/\.[^/.]+$/, "") : "file";
  const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
  const fileName = `${safePrefix}/${safeBase}_${Date.now()}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: uint8Array,
    ContentType: file.type || "application/octet-stream",
  });

  await s3Client.send(command);
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
};

export const uploadProfilePicture = async (file, userId) => {
  try {
    return await uploadToSupabaseStorage({ file, keyPrefix: `profiles/${userId}` });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export const deleteSupabaseStorageObjectByPublicUrl = async (publicUrl) => {
  try {
    const baseUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/`;
    const urlWithoutQuery = String(publicUrl || "").split("?")[0];
    if (!urlWithoutQuery.startsWith(baseUrl)) return;
    const key = decodeURIComponent(urlWithoutQuery.substring(baseUrl.length));
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
};

export const deleteProfilePicture = async (publicUrl) => {
  try {
    // Extract the key from the public URL
    // URL format: https://[project_ref].supabase.co/storage/v1/object/public/[bucket]/[key]
    const baseUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/`;
    
    await deleteSupabaseStorageObjectByPublicUrl(publicUrl);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
};
