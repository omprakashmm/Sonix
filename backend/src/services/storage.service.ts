/**
 * Sonix — Storage Service
 * Abstracts local filesystem / AWS S3 / Cloudflare R2 storage
 */
import fs from 'fs';
import path from 'path';
import { S3 } from 'aws-sdk';
import { logger } from '../utils/logger';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' | 's3' | 'r2'
const UPLOADS_DIR = process.env.LOCAL_UPLOAD_PATH || path.join(__dirname, '../../uploads');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

let s3Client: S3 | null = null;

if (STORAGE_TYPE === 's3') {
  s3Client = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
} else if (STORAGE_TYPE === 'r2') {
  // Cloudflare R2 — S3-compatible with a custom endpoint
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) throw new Error('R2_ACCOUNT_ID is required when STORAGE_TYPE=r2');
  s3Client = new S3({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: 'auto',
    signatureVersion: 'v4',
    s3ForcePathStyle: true, // required for R2
  });
}

export class StorageService {
  /**
   * Get public URL for a stored file
   */
  getPublicUrl(filePath: string): string {
    if (!filePath) return '';

    // Already a full URL — return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;

    if (STORAGE_TYPE === 's3') {
      const cdnUrl = process.env.AWS_S3_CDN_URL;
      return cdnUrl ? `${cdnUrl}/${filePath}` : filePath;
    }

    if (STORAGE_TYPE === 'r2') {
      // R2_PUBLIC_URL = your R2 public bucket URL or custom domain
      // e.g. https://pub-xxxx.r2.dev  OR  https://cdn.yourdomain.com
      const r2Url = process.env.R2_PUBLIC_URL;
      if (!r2Url) throw new Error('R2_PUBLIC_URL is required when STORAGE_TYPE=r2');
      return `${r2Url.replace(/\/$/, '')}/${filePath}`;
    }

    // Normalize Windows backslashes to forward slashes
    const normalized = filePath.replace(/\\/g, '/');

    // Find 'uploads/' in the path and use everything from that point
    const uploadsIdx = normalized.indexOf('uploads/');
    if (uploadsIdx >= 0) {
      return `${BACKEND_URL}/${normalized.slice(uploadsIdx)}`;
    }

    // Fallback: just append as-is
    return `${BACKEND_URL}/${normalized}`;
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if ((STORAGE_TYPE === 's3' || STORAGE_TYPE === 'r2') && s3Client) {
        const bucket = STORAGE_TYPE === 'r2' ? process.env.R2_BUCKET! : process.env.AWS_S3_BUCKET!;
        await s3Client
          .deleteObject({
            Bucket: bucket,
            Key: filePath,
          })
          .promise();
      } else {
        const absolutePath = path.resolve(filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }
    } catch (err) {
      logger.warn(`Could not delete file ${filePath}: ${err}`);
    }
  }

  /**
   * Upload a buffer to storage
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder = 'misc'
  ): Promise<string> {
    if ((STORAGE_TYPE === 's3' || STORAGE_TYPE === 'r2') && s3Client) {
      const bucket = STORAGE_TYPE === 'r2' ? process.env.R2_BUCKET! : process.env.AWS_S3_BUCKET!;
      const key = `${folder}/${filename}`;
      await s3Client
        .upload({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
        .promise();
      return key;
    } else {
      const dir = path.join(UPLOADS_DIR, folder);
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, filename);
      fs.writeFileSync(dest, buffer);
      return dest;
    }
  }

  /**
   * Ensure required upload directories exist
   */
  ensureDirectories(): void {
    const dirs = ['audio', 'covers', 'avatars', 'sample'].map((d) =>
      path.join(UPLOADS_DIR, d)
    );
    dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));
  }
}
