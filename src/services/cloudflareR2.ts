import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { ApiError } from "../utils/apiError";
import { r2Config } from "../config/cloudflare.config";

export class CloudflareService {
  private readonly s3 = new S3Client({
    region: r2Config.region,
    endpoint: r2Config.endpoint,
    credentials: r2Config.credentials,
  });
  async uploadFileS3(buffer: Buffer, key: string, mimetype: string) {
    const params = {
      Bucket: r2Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));

      const url = `${r2Config.R2_PUBLIC_DOMAIN}/${key}`;

      return {
        url,
        key,
      };
    } catch (error) {
      console.error("Error in uploading image to s3", error);
      throw new ApiError("فشل رفع الملف إلى S3", 500);
    }
  }
  async deleteFileS3(key: string) {
    const params = {
      Key: key,
      Bucket: r2Config.bucket,
    };
    try {
      await this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error("Error in deleteing file from S3", error);
      throw new ApiError("Error in deleteing file from S3", 500);
    }
  }

  async moveObject(oldKey: string, newKey: string) {
    // First copy
    await this.s3.send(
      new CopyObjectCommand({
        Bucket: r2Config.bucket,
        CopySource: `${r2Config.bucket}/${oldKey}`,
        Key: newKey,
      })
    );

    // Then delete old
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: r2Config.bucket,
        Key: oldKey,
      })
    );
  }

  getPublicUrl(key: string) {
    return `${r2Config.R2_PUBLIC_DOMAIN}/${key}`;
  }
}
