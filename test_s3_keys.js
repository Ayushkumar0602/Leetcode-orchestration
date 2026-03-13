import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
        const data = await client.send(new ListObjectsV2Command({ Bucket: "images" }));
        console.log("Objects:", data.Contents);
        
        if (data.Contents && data.Contents.length > 0) {
            console.log("Trying to delete first object:", data.Contents[0].Key);
            const delData = await client.send(new DeleteObjectCommand({ Bucket: "images", Key: data.Contents[0].Key }));
            console.log("Delete success:", delData);
        }
    } catch (err) {
        console.log("Error:", err);
    }
}
run();
