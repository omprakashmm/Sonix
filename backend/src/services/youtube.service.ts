/**
 * OpenWave — YouTube Audio Extraction Service
 *
 * Uses yt-dlp (recommended) with ytdl-core as fallback
 * Requires: yt-dlp and ffmpeg installed on the system
 *
 * Install yt-dlp: pip install yt-dlp
 * Install ffmpeg: https://ffmpeg.org/download.html
 */
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { MetadataService } from './metadata.service';
import { StorageService } from './storage.service';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const prisma = new PrismaClient();
const metadataService = new MetadataService();
const storageService = new StorageService();

const UPLOADS_DIR = process.env.LOCAL_UPLOAD_PATH || path.join(__dirname, '../../uploads');
const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';
const AUDIO_QUALITY = process.env.AUDIO_QUALITY || '320';

/** Quote a path so it's safe to use in shell commands */
function quotePath(p: string): string {
  return `"${p.replace(/"/g, '\\"')}"`;
}

export class YouTubeService {
  /**
   * Validate if a URL is a valid YouTube video URL
   */
  isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\//,
    ];
    return patterns.some((p) => p.test(url));
  }

  /**
   * Validate if a URL is a YouTube playlist URL
   */
  isValidPlaylistUrl(url: string): boolean {
    return /youtube\.com\/(playlist\?list=|watch\?.*list=)/.test(url);
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }

  /**
   * Extract playlist ID from YouTube URL
   */
  extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get video metadata using YouTube oEmbed API as primary (fast, no yt-dlp),
   * then enrich with yt-dlp if available.
   */
  async getMetadata(url: string): Promise<{
    title: string;
    artist: string;
    channel?: string;
    album?: string;
    thumbnail: string;
    duration: number;
    videoId: string;
  }> {
    const videoId = this.extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL — could not extract video ID');

    const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // ── Primary: YouTube oEmbed (no API key, always works) ──
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const oembed = await res.json() as { title: string; author_name: string; thumbnail_url: string };
        const artist = oembed.author_name || 'Unknown Artist';
        const title = this.cleanTitle(oembed.title || 'Unknown Title', artist);
        return {
          title,
          artist,
          channel: artist,
          thumbnail: oembed.thumbnail_url || thumbUrl,
          duration: 0, // oEmbed doesn't include duration
          videoId,
        };
      }
    } catch (err) {
      logger.warn(`oEmbed fallback failed for ${videoId}: ${err}`);
    }

    // ── Secondary: yt-dlp JSON dump ──────────────────────────
    try {
      const cmd = `${quotePath(YTDLP_PATH)} --dump-json --no-playlist ${quotePath(url)}`;
      const { stdout } = await execAsync(cmd, { timeout: 30000 });
      const info = JSON.parse(stdout);
      const artist = info.artist || info.uploader || info.channel || 'Unknown Artist';
      const title = info.track || this.cleanTitle(info.title || 'Unknown Title', artist);
      return {
        title,
        artist,
        channel: info.channel || artist,
        album: info.album || undefined,
        thumbnail: info.thumbnail || thumbUrl,
        duration: Math.round(info.duration || 0),
        videoId,
      };
    } catch (err) {
      logger.warn(`yt-dlp metadata unavailable for ${videoId}: ${err}`);
    }

    // ── Final fallback: minimal info ─────────────────────────
    return {
      title: 'Unknown Title',
      artist: 'Unknown Artist',
      channel: 'Unknown',
      thumbnail: thumbUrl,
      duration: 0,
      videoId,
    };
  }

  /**
   * Get playlist metadata (title + list of video entries) via yt-dlp
   */
  async getPlaylistMetadata(playlistUrl: string): Promise<{
    playlistTitle: string;
    channelName: string;
    totalItems: number;
    items: Array<{ videoId: string; title: string; artist: string; thumbnail: string; duration: number }>;
  }> {
    try {
      // Use yt-dlp to dump all entries as newline-delimited JSON
      const cmd = `${quotePath(YTDLP_PATH)} --flat-playlist --dump-json --no-warnings ${quotePath(playlistUrl)}`;
      const { stdout } = await execAsync(cmd, { timeout: 60000 });

      const lines = stdout.trim().split('\n').filter(Boolean);
      const items = lines.map((line) => {
        try {
          const entry = JSON.parse(line);
          const vid = entry.id || '';
          return {
            videoId: vid,
            title: entry.title || 'Unknown Title',
            artist: entry.uploader || entry.channel || 'Unknown Artist',
            thumbnail: entry.thumbnail || `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
            duration: Math.round(entry.duration || 0),
          };
        } catch {
          return null;
        }
      }).filter(Boolean) as Array<{ videoId: string; title: string; artist: string; thumbnail: string; duration: number }>;

      // Get playlist name from first entry's metadata
      let playlistTitle = 'YouTube Playlist';
      let channelName = 'Unknown';
      if (lines.length > 0) {
        try {
          const first = JSON.parse(lines[0]);
          playlistTitle = first.playlist_title || first.playlist || playlistTitle;
          channelName = first.playlist_uploader || first.uploader || channelName;
        } catch {/* ignore */}
      }

      return { playlistTitle, channelName, totalItems: items.length, items };
    } catch (err) {
      logger.error(`Playlist metadata error: ${err}`);
      throw new Error('Failed to fetch playlist info — make sure yt-dlp is installed and the playlist is public');
    }
  }

  /**
   * Main processing: download, convert, save to DB
   */
  async processImportJob(jobId: string, url: string, userId: string): Promise<void> {
    const audioDir = path.join(UPLOADS_DIR, 'audio');
    const coversDir = path.join(UPLOADS_DIR, 'covers');
    fs.mkdirSync(audioDir, { recursive: true });
    fs.mkdirSync(coversDir, { recursive: true });

    const outputFile = path.join(audioDir, `yt_${jobId}.%(ext)s`);
    const finalFile = path.join(audioDir, `yt_${jobId}.mp3`);
    const coverFile = path.join(coversDir, `yt_${jobId}.jpg`);

    try {
      // ── Step 1: Fetch metadata ──────────────────────────
      await this.updateJobStatus(jobId, 'FETCHING_META', 5);
      const metadata = await this.getMetadata(url);

      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          title: metadata.title,
          artist: metadata.artist,
          thumbnail: metadata.thumbnail,
          progress: 10,
        },
      });

      // ── Step 2: Download audio with yt-dlp ─────────────
      await this.updateJobStatus(jobId, 'DOWNLOADING', 10);

      await this.runYtDlp(url, outputFile, jobId);

      // ── Step 3: Convert to MP3 ──────────────────────────
      await this.updateJobStatus(jobId, 'CONVERTING', 80);

      // Check if file already is mp3 (yt-dlp may produce mp3 directly)
      const mp3Exists = fs.existsSync(finalFile);
      if (!mp3Exists) {
        // Find the downloaded file
        const dir = path.dirname(finalFile);
        const files = fs.readdirSync(dir).filter((f) => f.startsWith(`yt_${jobId}`));
        const sourceFile = files.length > 0 ? path.join(dir, files[0]) : null;

        if (sourceFile && sourceFile !== finalFile) {
          await this.convertToMp3(sourceFile, finalFile);
          fs.unlinkSync(sourceFile); // Remove original
        }
      }

      // ── Step 4: Download cover image ───────────────────
      if (metadata.thumbnail) {
        try {
          await this.downloadThumbnail(metadata.thumbnail, coverFile);
        } catch (_) {
          // Cover download is optional
        }
      }

      // ── Step 5: Extract precise metadata ───────────────
      let duration = metadata.duration;
      try {
        const fileMetadata = await metadataService.extractFromFile(finalFile);
        duration = fileMetadata.duration || duration;
      } catch (_) { /* use yt metadata duration */ }

      const fileSize = fs.existsSync(finalFile) ? fs.statSync(finalFile).size : 0;

      // ── Step 6: Create Track in DB ─────────────────────
      const track = await prisma.track.create({
        data: {
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          duration,
          fileUrl: finalFile,
          fileSize,
          bitrate: parseInt(AUDIO_QUALITY),
          format: 'MP3',
          coverUrl: fs.existsSync(coverFile) ? coverFile : undefined,
          source: 'YOUTUBE',
          sourceUrl: url,
          userId,
        },
      });

      // ── Step 7: Mark job as done ───────────────────────
      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: 'DONE',
          progress: 100,
          trackId: track.id,
          completedAt: new Date(),
        },
      });

      logger.info(`✅ Import job ${jobId} completed: "${track.title}"`);
    } catch (err: any) {
      logger.error(`❌ Import job ${jobId} failed: ${err.message}`);

      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: 'ERROR',
          error: err.message || 'Unknown error',
          completedAt: new Date(),
        },
      });

      // Cleanup partial files
      [finalFile, coverFile].forEach((f) => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
    }
  }

  /**
   * Run yt-dlp to download audio
   */
  private async runYtDlp(url: string, output: string, jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs: string[] = FFMPEG_PATH && FFMPEG_PATH !== 'ffmpeg'
        ? ['--ffmpeg-location', path.dirname(FFMPEG_PATH)]
        : [];

      const args = [
        url,
        '-x',                         // Extract audio only
        '--audio-format', 'mp3',
        '--audio-quality', AUDIO_QUALITY === '320' ? '0' : '5', // 0=best, 9=worst
        '-o', output,
        '--no-playlist',              // Don't download playlists
        '--no-warnings',
        '--progress',
        '--newline',
        ...ffmpegArgs,
      ];

      const proc = spawn(YTDLP_PATH, args);
      let progressPct = 10;

      proc.stdout.on('data', async (data: Buffer) => {
        const text = data.toString();
        const match = text.match(/(\d+\.?\d*)%/);
        if (match) {
          progressPct = Math.min(75, 10 + Math.round(parseFloat(match[1]) * 0.65));
          await prisma.importJob.update({
            where: { id: jobId },
            data: { progress: progressPct },
          }).catch(() => {});
        }
      });

      proc.stderr.on('data', (data: Buffer) => {
        logger.debug(`yt-dlp stderr: ${data.toString()}`);
      });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`yt-dlp exited with code ${code}`));
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to start yt-dlp: ${err.message}. Make sure yt-dlp is installed.`));
      });
    });
  }

  /**
   * Convert audio file to MP3 using ffmpeg
   */
  private async convertToMp3(input: string, output: string): Promise<void> {
    const bitrateMap: Record<string, string> = {
      '320': '320k', '256': '256k', '192': '192k', '128': '128k',
    };
    const bitrate = bitrateMap[AUDIO_QUALITY] || '320k';

    await execAsync(
      `${quotePath(FFMPEG_PATH)} -i ${quotePath(input)} -vn -ar 44100 -ac 2 -b:a ${bitrate} ${quotePath(output)} -y`,
      { timeout: 180000 } // 3 minute timeout
    );
  }

  /**
   * Download thumbnail image
   */
  private async downloadThumbnail(url: string, dest: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download thumbnail: ${response.status}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
  }

  /**
   * Update job status in DB
   */
  private async updateJobStatus(
    jobId: string,
    status: string,
    progress: number
  ): Promise<void> {
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: status as any, progress },
    });
  }

  /**
   * Clean up common title patterns (remove "Official Video", etc.)
   */
  private cleanTitle(title: string, artist: string): string {
    return title
      .replace(/\s*[\(\[](official\s*(music\s*)?video|lyric\s*video|audio|hd|hq|4k)[\)\]]/gi, '')
      .replace(new RegExp(`^${artist}\\s*[-–]\\s*`, 'i'), '')
      .trim();
  }
}
