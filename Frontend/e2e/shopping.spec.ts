import { test, expect } from '@playwright/test';

/**
 * E2E — Flusso di acquisto completo.
 *
 * Copre l'happy path più prezioso dell'applicazione:
 * login → catalogo → aggiunta al carrello → checkout → conferma ordine.
 *
 * Questo singolo test attraversa:
 * - Auth interceptor (propagazione del JWT tra le richieste)
 * - Persistenza del carrello sul backend
 * - Validazione del form di checkout (Reactive Forms)
 * - Transazione di creazione ordine (decremento stock + svuotamento carrello)
 */

test.describe('Shopping flow', () => {
  test('customer can browse, add to cart, and complete a purchase', async ({ page }) => {
    // -----------------------------------------------------------------------
    // 1. Login con il cliente del seed
    // -----------------------------------------------------------------------
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.locator('form').getByRole('button', { name: /^Login$/ }).click();
    await expect(page).toHaveURL(/\/products$/);

    // -----------------------------------------------------------------------
    // 2. Aggiungi la prima card prodotto al carrello
    //    (il bottone ha aria-label "Aggiungi al carrello")
    // -----------------------------------------------------------------------
    const firstCard = page.locator('app-product-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByRole('button', { name: 'Aggiungi al carrello' }).click();

    // -----------------------------------------------------------------------
    // 3. Vai su /cart dall'header e verifica che ci sia almeno un articolo
    // -----------------------------------------------------------------------
    await page.locator('mat-toolbar').getByRole('button', { name: 'Shopping cart' }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { name: 'IL TUO CARRELLO' })).toBeVisible();
    await expect(page.locator('mat-card.cart-item').first()).toBeVisible();

    // -----------------------------------------------------------------------
    // 4. Procedi al checkout
    // -----------------------------------------------------------------------
    await page.getByRole('button', { name: /Vai al Checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    // -----------------------------------------------------------------------
    // 5. Compila il form (formControlName è più stabile delle label quando
    //    ci sono campi adiacenti simili come "Nome" / "Cognome");
    //    il metodo di spedizione è preselezionato su "standard"
    // -----------------------------------------------------------------------
    await page.locator('input[formcontrolname=firstName]').fill('Mario');
    await page.locator('input[formcontrolname=lastName]').fill('Rossi');
    await page.locator('input[formcontrolname=email]').fill('mario@example.com');
    await page.locator('input[formcontrolname=street]').fill('Via Roma 1');
    await page.locator('input[formcontrolname=city]').fill('Milano');
    await page.locator('input[formcontrolname=zip]').fill('20100');
    await page.getByRole('checkbox').check();

    // -----------------------------------------------------------------------
    // 6. Invia e verifica il messaggio di successo
    // -----------------------------------------------------------------------
    await page.getByRole('button', { name: /Completa l'ordine/i }).click();
    await expect(page.getByText(/Ordine completato con successo/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
