import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {s3client, S3_BUCKET} from "../config/aws.js";
import crypto from "crypto";

export const uploadToS3 = async (
    file: Express.Multer.File,
    userId: string,
): Promise<{key: string; bucket: string}> => {
    const fileExtension = file.originalname.split(".").pop();
    const uniqueKey = `${userId}/${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3client.send(command);

    return {
        key: uniqueKey,
        bucket: S3_BUCKET,
    };
};

export const getPresignedUrl = async (
    key: string,
    expiresIn: number = 3600,
): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });

    const url = await getSignedUrl(s3client, command, {expiresIn});
    return url;
};

export const deleteFromS3 = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });

    await s3client.send(command);
};

export const checkFileExists = async (key: string): Promise<boolean> => {
    try {
        const command = new HeadObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        });

        await s3client.send(command);
        return true;
    } catch (err) {
        return false;
    }
};
