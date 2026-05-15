import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'results/results.json' }],
    ['html', { outputFolder: 'results/html', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'ko-KR',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
