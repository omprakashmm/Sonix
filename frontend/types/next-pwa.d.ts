// Type shim for next-pwa (no official @types package)
declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: unknown[];
    [key: string]: unknown;
  }
  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export = withPWA;
}
