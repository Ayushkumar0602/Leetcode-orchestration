import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
