import { PutObjectCommand, S3, DeleteObjectCommand } from "@aws-sdk/client-s3";
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
