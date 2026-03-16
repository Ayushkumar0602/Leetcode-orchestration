const { S3Client, DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function s3Client() {
  const endpoint = requireEnv("SUPABASE_S3_ENDPOINT");
  const region = process.env.SUPABASE_S3_REGION || "us-east-1";
  const accessKeyId = requireEnv("SUPABASE_S3_ACCESS_ID");
  const secretAccessKey = requireEnv("SUPABASE_S3_SECRET_KEY");

  return new S3Client({
    forcePathStyle: true,
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function bucketName() {
  return requireEnv("SUPABASE_S3_BUCKET");
}

function publicBaseUrl() {
  // e.g. https://<project>.supabase.co
  return requireEnv("SUPABASE_PROJECT_URL").replace(/\/+$/, "");
}

function storagePublicUrlForKey(key) {
  return `${publicBaseUrl()}/storage/v1/object/public/${bucketName()}/${key}`;
}

async function presignPutObject({ key, contentType }) {
  const client = s3Client();
  const cmd = new PutObjectCommand({
    Bucket: bucketName(),
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 60 * 5 });
  return { uploadUrl, publicUrl: storagePublicUrlForKey(key) };
}

async function deleteByPublicUrl(publicUrl) {
  const base = `${publicBaseUrl()}/storage/v1/object/public/${bucketName()}/`;
  const urlWithoutQuery = String(publicUrl || "").split("?")[0];
  if (!urlWithoutQuery.startsWith(base)) return { deleted: false, reason: "not_in_bucket" };
  const key = decodeURIComponent(urlWithoutQuery.substring(base.length));

  const client = s3Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucketName(), Key: key }));
  return { deleted: true, key };
}

module.exports = { presignPutObject, deleteByPublicUrl, storagePublicUrlForKey };

