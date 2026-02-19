import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().startsWith("mongodb://"),
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    AWS_REGION: z.string().default("us-east-1"),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_S3_BUCKET_NAME: z.string(),
});

export const env = envSchema.parse(process.env);
// type ENV_Type = z.infer<typeof envSchema>;

// try {
//     env = zodSchema.parse(process.env);
// } catch (err) {
//     if (err instanceof z.ZodError) {
//         err.issues.forEach((e) => {
//             const path = err.path.join(".");
//             console.error(` ${path}: ${e.message}`);
//         });
//         process.exit(1);
//     }
// }
