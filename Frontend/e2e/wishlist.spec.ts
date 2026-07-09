import { test, expect } from '@playwright/test';

/**
 * E2E — Wishlist add/remove.
 *
 * Un unico test attraversa l'intero ciclo di vita: aggiunta dal catalogo →
 * verifica in /wishlist → rimozione → stato vuoto. Un solo test rende il
 * flusso deterministico: sulla card il bottone wishlist è un TOGGLE, quindi
 * spezzare add e remove in test separati renderebbe lo stato iniziale del
 * secondo dipendente dal primo.
 */

test.describe('Wishlist', () => {
  test('customer can add a product to the wishlist and remove it', async ({ page }) => {
    // -----------------------------------------------------------------------
    // 1. Login con il cliente del seed
    // -----------------------------------------------------------------------
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.locator('form').getByRole('button', { name: /^Login$/ }).click();
    await expect(page).toHaveURL(/\/products$/);

    // -----------------------------------------------------------------------
    // 2. Aggiungi il primo prodotto alla wishlist (bottone cuore sulla card,
    //    aria-label "Wishlist" — da non confondere con l'icona nell'header)
    // -----------------------------------------------------------------------
    const firstCard = page.locator('app-product-card').first();
    await expect(firstCard).toBeVisible();
    const productTitle = (await firstCard.locator('.title').textContent())!.trim();

    await firstCard.getByRole('button', { name: 'Wishlist' }).click();

    // -----------------------------------------------------------------------
    // 3. Vai su /wishlist dall'header e verifica che il prodotto ci sia
    // -----------------------------------------------------------------------
    await page.locator('mat-toolbar').getByRole('button', { name: 'Wishlist' }).click();
    await expect(page).toHaveURL(/\/wishlist$/);
    await expect(page.getByRole('heading', { name: productTitle })).toBeVisible();

    // -----------------------------------------------------------------------
    // 4. Rimuovi l'articolo e verifica lo stato vuoto
    // -----------------------------------------------------------------------
    await page.getByRole('button', { name: 'Rimuovi dalla wishlist' }).first().click();
    await expect(page.getByText('La tua wishlist è vuota')).toBeVisible({
      timeout: 10_000,
    });
  });
});
