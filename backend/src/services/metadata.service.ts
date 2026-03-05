/**
 * OpenWave — Metadata Extraction Service
 * Extracts ID3/metadata tags from audio files
 */
import * as mm from 'music-metadata';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { StorageService } from './storage.service';

const UPLOADS_DIR = process.env.LOCAL_UPLOAD_PATH || path.join(__dirname, '../../uploads');
const storageService = new StorageService();

export interface ExtractedMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  coverUrl?: string;
  lyrics?: string;
}

export class MetadataService {
  /**
   * Extract metadata from an audio file
   */
  async extractFromFile(filePath: string): Promise<ExtractedMetadata> {
    try {
      const metadata = await mm.parseFile(filePath, { duration: true });
      const { common, format } = metadata;

      let coverUrl: string | undefined;

      // Extract embedded cover art
      if (common.picture && common.picture.length > 0) {
        coverUrl = await this.saveCoverArt(common.picture[0], path.basename(filePath));
      }

      return {
        title: common.title,
        artist: common.artist || (common.artists?.join(', ')),
        album: common.album,
        genre: common.genre?.[0],
        duration: format.duration || 0,
        bitrate: format.bitrate ? Math.round(format.bitrate / 1000) : undefined,
        sampleRate: format.sampleRate,
        channels: format.numberOfChannels,
        coverUrl,
        lyrics: (common.lyrics?.[0] as any)?.text ?? (common.lyrics?.[0] as unknown as string | undefined),
      };
    } catch (err) {
      logger.warn(`Could not extract metadata from ${filePath}: ${err}`);
      return { duration: 0 };
    }
  }

  /**
   * Save embedded cover art to disk
   */
  private async saveCoverArt(
    picture: { data: Buffer; format: string },
    sourceBasename: string
  ): Promise<string | undefined> {
    try {
      const coversDir = path.join(UPLOADS_DIR, 'covers');
      fs.mkdirSync(coversDir, { recursive: true });

      const filename = `cover_${path.parse(sourceBasename).name}.webp`;
      const outputPath = path.join(coversDir, filename);

      await sharp(picture.data)
        .resize(500, 500, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(outputPath);

      return storageService.getPublicUrl(outputPath);
    } catch (err) {
      logger.warn(`Could not save cover art: ${err}`);
      return undefined;
    }
  }

  /**
   * Format duration in MM:SS
   */
  static formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
