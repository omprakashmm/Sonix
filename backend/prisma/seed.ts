/// <reference types="node" />
/**
 * OpenWave — Database Seed Script
 * Populates the database with sample data for development
 */
import { PrismaClient, Role, AudioFormat, TrackSource } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sonix.dev' },
    update: {},
    create: {
      email: 'admin@sonix.dev',
      name: 'Sonix Admin',
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  // ─── Demo User ───────────────────────────────────────────
  const demoPassword = await bcrypt.hash('demo123', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@sonix.dev' },
    update: {},
    create: {
      email: 'demo@sonix.dev',
      name: 'Demo User',
      username: 'demouser',
      password: demoPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  });

  // ─── Sample Tracks ───────────────────────────────────────
  const tracks = await Promise.all([
    prisma.track.upsert({
      where: { id: 'sample-track-1' },
      update: {},
      create: {
        id: 'sample-track-1',
        title: 'Electronic Dreams',
        artist: 'Sonix Artist',
        album: 'Sample Album',
        genre: 'Electronic',
        duration: 210,
        fileUrl: '/uploads/sample/track1.mp3',
        format: AudioFormat.MP3,
        bitrate: 320,
        source: TrackSource.UPLOAD,
        playCount: 142,
        likeCount: 28,
        userId: admin.id,
      },
    }),
    prisma.track.upsert({
      where: { id: 'sample-track-2' },
      update: {},
      create: {
        id: 'sample-track-2',
        title: 'Midnight Waves',
        artist: 'Chill Vibes',
        album: 'Night Sessions',
        genre: 'Lo-Fi',
        duration: 185,
        fileUrl: '/uploads/sample/track2.mp3',
        format: AudioFormat.MP3,
        bitrate: 192,
        source: TrackSource.UPLOAD,
        playCount: 87,
        likeCount: 15,
        userId: admin.id,
      },
    }),
    prisma.track.upsert({
      where: { id: 'sample-track-3' },
      update: {},
      create: {
        id: 'sample-track-3',
        title: 'Neon Lights',
        artist: 'Synthwave Studio',
        album: 'Retrowave Vol. 1',
        genre: 'Synthwave',
        duration: 244,
        fileUrl: '/uploads/sample/track3.mp3',
        format: AudioFormat.MP3,
        bitrate: 320,
        source: TrackSource.UPLOAD,
        playCount: 320,
        likeCount: 64,
        userId: admin.id,
      },
    }),
  ]);

  // ─── Sample Playlists ────────────────────────────────────
  const playlist = await prisma.playlist.upsert({
    where: { id: 'sample-playlist-1' },
    update: {},
    create: {
      id: 'sample-playlist-1',
      name: 'Sonix Favorites',
      description: 'A curated selection of the best tracks',
      isPublic: true,
      userId: admin.id,
    },
  });

  // Add tracks to playlist
  for (let i = 0; i < tracks.length; i++) {
    await prisma.playlistTrack.upsert({
      where: {
        playlistId_trackId: {
          playlistId: playlist.id,
          trackId: tracks[i].id,
        },
      },
      update: {},
      create: {
        playlistId: playlist.id,
        trackId: tracks[i].id,
        position: i,
      },
    });
  }

  // ─── Liked tracks for demo user ──────────────────────────
  await prisma.likedTrack.upsert({
    where: { userId_trackId: { userId: demo.id, trackId: tracks[0].id } },
    update: {},
    create: { userId: demo.id, trackId: tracks[0].id },
  });

  console.log('✅ Seed complete!');
  console.log('   Admin: admin@sonix.dev / admin123');
  console.log('   Demo:  demo@sonix.dev  / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
