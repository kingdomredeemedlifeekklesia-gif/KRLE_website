import { defineConfig } from '@railway/cli';

export default defineConfig({
  services: {
    KRLE_website: {
      appName: 'KRLE_website',
      build: {
        builder: 'NIXPACKS',
        buildCommand: 'npm run build',
      },
      deploy: {
        startCommand: 'npm start',
      },
    },
  },
});
