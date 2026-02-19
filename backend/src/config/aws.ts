import {S3Client} from "@aws-sdk/client-s3";
import {env} from "./env.js";

console.log(env.AWS_REGION);
console.log(env.AWS_ACCESS_KEY_ID);
console.log(env.AWS_SECRET_ACCESS_KEY);

if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
) {
    throw new Error("AWS credentials not properly configured.");
}

export const s3client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME as string;
