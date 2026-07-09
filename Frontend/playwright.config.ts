import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — suite E2E del progetto.
 *
 * Due scenari di esecuzione:
 * 1. In locale: Playwright avvia da solo backend (Rails, env test) e frontend
 *    (Angular dev server) tramite il blocco `webServer` qui sotto.
 * 2. In CI: il workflow avvia i server esplicitamente e Playwright li riusa
 *    (REUSE_SERVER=1 salta il blocco webServer).
 *
 * I file di test vivono in ./e2e e usano il runner @playwright/test —
 * da NON confondere con Vitest, che resta su src/**\/*.spec.ts.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // seriale: i test condividono lo stesso DB del backend
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1, // singolo worker per evitare race sullo stato condiviso del backend
  reporter: process.env['CI'] ? [['html', { open: 'never' }], ['github']] : 'html',

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Avvio automatico di backend + frontend prima dei test.
  // In CI REUSE_SERVER=1 lo salta (il workflow avvia i server da solo).
  webServer: process.env['REUSE_SERVER']
    ? undefined
    : [
        {
          command:
            'cd ../Backend && RAILS_ENV=test bin/rails db:test:prepare && RAILS_ENV=test bin/rails db:seed && RAILS_ENV=test bin/rails server -p 3000',
          port: 3000,
          timeout: 120_000,
          reuseExistingServer: !process.env['CI'],
        },
        {
          command: 'npm start',
          port: 4200,
          timeout: 120_000,
          reuseExistingServer: !process.env['CI'],
        },
      ],
});
