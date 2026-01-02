import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.absensholatapp.app',
  appName: 'MTsN 1 Super App',
  webDir: 'out',
  server: {
    url: 'https://absensholatapp.vercel.app',
    cleartext: true
  }
};

export default config;
