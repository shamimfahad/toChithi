import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.mjs',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'bn-BD',
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  webServer: { command: 'node scripts/serve.mjs', url: 'http://localhost:4173', reuseExistingServer: true },
});
