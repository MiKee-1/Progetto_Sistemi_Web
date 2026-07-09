import { test, expect } from '@playwright/test';

/**
 * E2E — Flussi di autenticazione.
 *
 * Copre:
 * 1. Un cliente esistente (dal seed) fa login e atterra su /products
 *    con le icone da utente autenticato nell'header
 * 2. Un nuovo visitatore si registra con una email fresca e atterra
 *    su /products già autenticato
 *
 * Il seed del backend fornisce il cliente `user@example.com / password123`.
 */

test.describe('Authentication', () => {
  test('seeded customer can log in and reach the products page', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');

    await page.locator('form').getByRole('button', { name: /^Login$/ }).click();

    await expect(page).toHaveURL(/\/products$/);
    // L'icona del carrello nell'header è renderizzata solo da autenticati.
    await expect(
      page.locator('mat-toolbar').getByRole('button', { name: 'Shopping cart' })
    ).toBeVisible();
  });

  test('new visitor can register and is redirected to products as a logged in user', async ({
    page,
  }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.goto('/register');

    await page.getByLabel('First Name').fill('E2e');
    await page.getByLabel('Last Name').fill('Tester');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Conferma Password').fill('password123');

    await page.locator('form').getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/products$/);
    // Dopo la registrazione l'header mostra il menu utente.
    await expect(
      page.locator('mat-toolbar').getByRole('button', { name: 'User menu' })
    ).toBeVisible();
  });
});
