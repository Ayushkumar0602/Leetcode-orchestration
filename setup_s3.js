import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    forcePathStyle: true,
    region: "us-east-1", // Actually "ap-south-1" or similar for Supabase, but "us-east-1" works for some
    endpoint: "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3",
    credentials: {
      accessKeyId: "b6aae57565cde6c3aa4574fca0f871f2",
      secretAccessKey: "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836"
    }
});

async function run() {
    try {
        const data = await client.send(new ListBucketsCommand({}));
        console.log("Success", data.Buckets);
    } catch (err) {
        console.log("Error", err);
    }
}
run();
