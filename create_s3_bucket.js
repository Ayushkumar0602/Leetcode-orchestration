import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    forcePathStyle: true,
    region: "us-east-1",
    endpoint: "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3",
    credentials: {
      accessKeyId: "b6aae57565cde6c3aa4574fca0f871f2",
      secretAccessKey: "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836"
    }
});

async function run() {
    try {
        const data = await client.send(new CreateBucketCommand({ Bucket: "resume" }));
        console.log("Bucket created successfully:", data);
    } catch (err) {
        if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') {
           console.log("Bucket already exists.");
        } else {
           console.log("Error creating bucket:", err);
        }
    }
}
run();
