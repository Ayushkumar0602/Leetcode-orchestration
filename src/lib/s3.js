import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Ensure keys from user prompt
const ACCESS_ID = "b6aae57565cde6c3aa4574fca0f871f2";
const ACCESS_KEY = "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836";
const ENDPOINT = "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3";
const REGION = "us-east-1"; // Region can be generic for Supabase S3
const BUCKET_NAME = "images";
const CHAT_BUCKET_NAME = "chat-files";
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

export const uploadProfilePicture = async (file, userId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `profiles/${userId}_${Date.now()}.${fileExt}`;
    
    // AWS SDK v3 in the browser requires a browser-compatible buffer stream, ArrayBuffer, or TypedArray
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type,
      // ACL: 'public-read' // Might not be needed if bucket is already public
    });

    await s3Client.send(command);

    // After success, construct the Supabase storage public URL
    // Format: https://[project_ref].supabase.co/storage/v1/object/public/[bucket]/[key]
    const publicUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export const deleteProfilePicture = async (publicUrl) => {
  try {
    // Extract the key from the public URL
    // URL format: https://[project_ref].supabase.co/storage/v1/object/public/[bucket]/[key]
    const baseUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/`;
    
    // Remove query parameters if any (e.g. ?t=123)
    const urlWithoutQuery = publicUrl.split('?')[0];

    if (!urlWithoutQuery.startsWith(baseUrl)) {
      console.warn("URL does not match expected bucket format, skipping delete.");
      return;
    }
    
    // Decode URI component because S3 Keys are literal characters, but URLs are encoded
    const key = decodeURIComponent(urlWithoutQuery.substring(baseUrl.length));
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
};

export const uploadChatFile = async (file, { conversationId, senderUid }) => {
  try {
    const safeBaseName = (file.name || 'file')
      .replace(/[^\w.\- ]+/g, '')
      .trim()
      .slice(0, 80) || 'file';

    const fileName = `chats/${conversationId}/${senderUid}_${Date.now()}_${safeBaseName}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: CHAT_BUCKET_NAME,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type || 'application/octet-stream',
    });

    await s3Client.send(command);

    const publicUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${CHAT_BUCKET_NAME}/${encodeURIComponent(fileName).replace(/%2F/g, '/')}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading chat file to S3:", error);
    throw error;
  }
};
