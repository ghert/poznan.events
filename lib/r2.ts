import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export class ImageValidationError extends Error {}

/**
 * Uploads a user-submitted event image to R2 and returns its public URL.
 */
export async function uploadEventImage(file: File): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext)
    throw new ImageValidationError("Dozwolone formaty: JPG, PNG, WebP.");
  if (file.size > MAX_IMAGE_BYTES)
    throw new ImageValidationError("Grafika może mieć maksymalnie 3,5 MB.");

  const key = `events/${crypto.randomUUID()}.${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  );

  return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}
