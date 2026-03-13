import {
  PutObjectCommand,
  S3,
  DeleteObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

export const s3Client = new S3({
  endpoint: process.env.DIGITAL_OCEAN_BUCKET_ENDPOINT,
  region: process.env.DIGITAL_OCEAN_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_BUCKET_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.DIGITAL_OCEAN_BUCKET_SECRET_ACCESS_KEY || ""
  }
});

export async function uploadBulkImages(files: File[], folder: string) {
  const s3UploadPromises = files.map(async (file) => {
    return uploadFile(file, folder);
  });
  const imagesUploaded = await Promise.all(s3UploadPromises);
  const urls = imagesUploaded.map((image) => image.url);
  return urls;
}

export async function uploadFile(file: File, folder: string) {
  const fileExtension = file.name.split(".").pop();
  const fileBuffer = await file.arrayBuffer();
  const fileName = `${uuid()}.${fileExtension}`;
  const result = await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: new Uint8Array(fileBuffer),
      ACL: "public-read"
    })
  );
  return {
    ...result,
    url: `${process.env.DIGITAL_OCEAN_BUCKET_URL_ENDPOINT}/${folder}/${fileName}`
  };
}

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  extension: string = "png"
) {
  const fileName = `${uuid()}.${extension}`;
  const result = await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: new Uint8Array(buffer),
      ContentType: `image/${extension}`,
      ACL: "public-read"
    })
  );
  return {
    ...result,
    url: `${process.env.DIGITAL_OCEAN_BUCKET_URL_ENDPOINT}/${folder}/${fileName}`
  };
}

export async function downloadBuffer(url: string): Promise<Buffer> {
  // Extract key from URL — handle both CDN and non-CDN URLs
  // e.g. https://almanac.fra1.cdn.digitaloceanspaces.com/path/file.png → path/file.png
  // e.g. https://almanac.fra1.digitaloceanspaces.com/path/file.png → path/file.png
  const key = url.replace(
    /^https?:\/\/[^/]+\//,
    ""
  );
  console.log(`[s3] downloadBuffer key="${key}" from url="${url}"`);
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: key
    })
  );
  const stream = response.Body;
  if (!stream) throw new Error(`Empty response for key: ${key}`);
  return Buffer.from(await stream.transformToByteArray());
}

export async function uploadJsonMetadata(
  json: object,
  folder: string
): Promise<string> {
  const fileName = `${uuid()}.json`;
  const body = Buffer.from(JSON.stringify(json));
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: new Uint8Array(body),
      ContentType: "application/json",
      ACL: "public-read"
    })
  );
  return `${process.env.DIGITAL_OCEAN_BUCKET_URL_ENDPOINT}/${folder}/${fileName}`;
}

export const deleteImageFromSpaces = async (url: string) => {
  const key = url.replace(
    `${process.env.DIGITAL_OCEAN_BUCKET_URL_ENDPOINT}/`,
    ""
  );
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
      Key: key
    })
  );
};
