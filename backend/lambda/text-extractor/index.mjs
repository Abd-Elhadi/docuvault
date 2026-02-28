import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";
import pdfParse from "pdf-parse";

console.log('where will this be logged on AWS????')

const s3Client = new S3Client({ region: process.env.MY_AWS_REGION });
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = await MongoClient.connect(process.env.DATABASE_URL);
  cachedDb = client.db();
  return cachedDb;
}

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

export const handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  // Download from S3
  const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
  const s3Response = await s3Client.send(getObjectCommand);
  
  const chunks = [];
  for await (const chunk of s3Response.Body) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Extract text
  let extractedText = '';
  if (s3Response.ContentType === 'application/pdf') {
    extractedText = await extractTextFromPDF(buffer);
  }

  // Update MongoDB
  const db = await connectToDatabase();
  await db.collection('documents').updateOne(
    { s3Key: key },
    { $set: { extractedText, textExtractedAt: new Date() } }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success', characters: extractedText.length })
  };
};