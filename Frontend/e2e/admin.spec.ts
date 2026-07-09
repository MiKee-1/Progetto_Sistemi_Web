import { test, expect } from '@playwright/test';

/**
 * E2E — Gestione prodotti admin.
 *
 * Un unico test ricco attraversa l'intero ciclo CRUD da utente admin:
 * create → verifica → update → verifica → delete → verifica.
 *
 * Perché un solo test (e non 3): le azioni condividono lo stato — il
 * prodotto creato al passo 1 è il soggetto dei passi successivi. Separarle
 * richiederebbe di propagare stato tra test, contro la filosofia
 * seriale+isolata della suite.
 *
 * Nota sulla UI: la dashboard usa un form inline nella tab "Products
 * Management" (non un dialog); l'eliminazione passa da window.confirm.
 */

test.describe('Admin product CRUD', () => {
  test('admin can create, update and delete a product', async ({ page }) => {
    // -----------------------------------------------------------------------
    // 1. Login admin: il redirect post-login per role=admin è /admin
    // -----------------------------------------------------------------------
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.locator('form').getByRole('button', { name: /^Login$/ }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

    // -----------------------------------------------------------------------
    // 2. Apri la tab di gestione prodotti (la prima tab è Statistics)
    // -----------------------------------------------------------------------
    await page.getByRole('tab', { name: 'Products Management' }).click();

    // -----------------------------------------------------------------------
    // 3. CREATE — compila il form inline e invia
    //    (formControlName è più stabile delle label con campi simili
    //    adiacenti come Price / Original Price)
    // -----------------------------------------------------------------------
    const timestamp = Date.now();
    const productId = `e2e-product-${timestamp}`;
    const productTitle = `E2E Product ${timestamp}`;

    await page.locator('input[formcontrolname=id]').fill(productId);
    await page.locator('input[formcontrolname=title]').fill(productTitle);
    await page.locator('textarea[formcontrolname=description]').fill('Creato dalla suite E2E');
    await page.locator('input[formcontrolname=price]').fill('99.99');
    await page.locator('input[formcontrolname=original_price]').fill('120');
    await page.locator('input[formcontrolname=quantity]').fill('50');

    const createResponse = page.waitForResponse(
      (r) => r.url().endsWith('/api/admin/products') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Create Product' }).click();
    expect((await createResponse).status()).toBe(201);

    // Il nuovo prodotto deve comparire nella tabella.
    await expect(page.getByRole('cell', { name: productTitle })).toBeVisible({
      timeout: 10_000,
    });

    // -----------------------------------------------------------------------
    // 4. UPDATE — Edit sulla riga, cambia il prezzo, salva
    // -----------------------------------------------------------------------
    const productRow = page.getByRole('row', { name: new RegExp(productTitle) });
    await productRow.getByTitle('Edit').click();

    await page.locator('input[formcontrolname=price]').fill('49.99');
    // Il servizio Angular usa http.put (non patch) per l'update.
    const updateResponse = page.waitForResponse(
      (r) => r.url().includes('/api/admin/products/') && r.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Update Product' }).click();
    expect((await updateResponse).status()).toBe(200);

    // La cella prezzo della riga deve mostrare il nuovo valore.
    await expect(
      page.getByRole('row', { name: new RegExp(productTitle) }).getByText('49.99')
    ).toBeVisible({ timeout: 10_000 });

    // -----------------------------------------------------------------------
    // 5. DELETE — il componente usa window.confirm: va accettato prima del click
    // -----------------------------------------------------------------------
    page.once('dialog', (dialog) => dialog.accept());
    const deleteResponse = page.waitForResponse(
      (r) => r.url().includes('/api/admin/products/') && r.request().method() === 'DELETE'
    );
    await page.getByRole('row', { name: new RegExp(productTitle) }).getByTitle('Delete').click();
    expect((await deleteResponse).status()).toBe(200);

    // Il prodotto deve sparire dalla tabella.
    await expect(page.getByRole('cell', { name: productTitle })).toHaveCount(0, {
      timeout: 10_000,
    });
  });
});
