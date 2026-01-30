import { defineConfig } from '@playwright/test';

const FRONTEND = process.env.PORT ?? '3000';
const BACKEND = process.env.VITE_BACKEND_PORT ?? '3001';

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: false,
  workers: 1, // important: shared DB state
  use: {
    baseURL: `http://localhost:${FRONTEND}`,
    testIdAttribute: 'data-test', // RWA uses data-test everywhere
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'yarn dev',
    url: `http://localhost:${FRONTEND}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
