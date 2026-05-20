# Test Mancanti

## Stato attuale

**Backend (MiniTest):** 2 test reali
- `product_test.rb` → 2 test su validazioni di Product
- `orders_controller_test.rb` → 2 test su creazione ordine

**Frontend (Jasmine):** 11 test, tutti "smoke test" (verificano solo `toBeTruthy`, zero logica)

**Property testing:** nessuno
**Mutation testing:** nessuno

---

## 1. Testing Classico

### Backend — Unit Test sui Modelli

#### Cart
- `total()` restituisce la somma corretta di quantity * unit_price per ogni item
- `total()` restituisce 0.0 se il carrello è vuoto
- `item_count()` restituisce la somma delle quantità (non il numero di righe)
- `empty?()` restituisce true se non ci sono item
- `clear_items()` distrugge tutti i cart_items associati
- `as_json()` include id, userId, items, total, itemCount, createdAt, updatedAt
- Validazione: user_id deve essere presente
- Validazione: user_id deve essere univoco (un solo carrello per utente)

#### CartItem
- Validazione: quantity deve essere > 0
- Validazione: quantity deve essere un intero
- Validazione: unit_price deve essere > 0
- Validazione: product_id deve essere univoco per cart_id
- Validazione on create: prodotto out of stock viene rifiutato
- Validazione: quantity non può superare product.quantity disponibile
- `as_json()` include subtotal calcolato correttamente (quantity * unit_price)
- `as_json()` include il product annidato

#### User
- Validazione: email deve essere presente
- Validazione: email deve essere univoca
- Validazione: email deve rispettare il formato corretto
- Validazione: first_name deve essere presente
- Validazione: last_name deve essere presente
- Validazione: password deve essere lunga almeno 6 caratteri
- Validazione: role deve essere "user" o "admin"
- `admin?()` restituisce true solo se role == "admin"
- `full_name()` concatena first_name e last_name
- `as_json()` non espone password_digest

#### Order / OrderItem
- `Order` ha relazione has_many :order_items
- `OrderItem` validazione: quantity > 0
- `OrderItem` validazione: unit_price > 0
- `OrderItem` validazione: product_id univoco per order_id

#### Wishlist
- `item_count()` restituisce il numero di prodotti nella lista
- `empty?()` restituisce true se non ci sono item
- `clear_items()` distrugge tutti i wishlist_items
- `as_json()` include id, userId, items, itemCount
- Validazione: user_id deve essere univoco

#### WishlistItem
- Validazione: product_id deve essere univoco per wishlist_id
- `as_json()` include il product annidato

---

### Backend — Integration Test sui Controller

#### AuthenticationController
- `POST /api/register` con dati validi → 201, restituisce token JWT e user
- `POST /api/register` con email già esistente → 422, messaggio di errore
- `POST /api/register` con password troppo corta → 422
- `POST /api/login` con credenziali corrette → 200, restituisce token JWT
- `POST /api/login` con password errata → 401
- `POST /api/login` con email non esistente → 401
- `GET /api/me` con token valido → 200, restituisce dati utente
- `GET /api/me` senza token → 401

#### ProductsController
- `GET /api/products` → 200, lista prodotti paginata
- `GET /api/products?title=xyz` → filtra per titolo
- `GET /api/products?min_price=10&max_price=50` → filtra per prezzo
- `GET /api/products?sort=price_asc` → ordina correttamente
- `GET /api/products?page=2&limit=5` → paginazione corretta
- `GET /api/products/:id` con id valido → 200, dati del prodotto
- `GET /api/products/:id` con id inesistente → 404

#### CartsController
- `GET /api/cart` senza autenticazione → 401
- `GET /api/cart` con utente autenticato senza carrello → crea carrello vuoto e restituisce 200
- `GET /api/cart` con carrello esistente → 200, restituisce items
- `POST /api/cart/items` con prodotto valido → 200, item aggiunto
- `POST /api/cart/items` con prodotto già nel carrello → aggiorna la quantità
- `POST /api/cart/items` con prodotto out of stock → 422
- `POST /api/cart/items` con quantity > stock disponibile → 422
- `POST /api/cart/items` con product_id inesistente → 404
- `PATCH /api/cart/items/:id` aggiorna la quantità → 200
- `PATCH /api/cart/items/:id` con id non appartenente all'utente → 404
- `DELETE /api/cart/items/:id` rimuove l'item → 200
- `DELETE /api/cart` svuota tutti gli item → 200, cart con items vuoto

#### WishlistsController
- `GET /api/wishlist` senza autenticazione → 401
- `GET /api/wishlist` con utente autenticato → 200, crea wishlist se non esiste
- `POST /api/wishlist/items` con prodotto valido → 200, item aggiunto
- `POST /api/wishlist/items` con prodotto già in wishlist → 422, errore "already in wishlist"
- `POST /api/wishlist/items` con product_id inesistente → 404
- `DELETE /api/wishlist/items/:id` rimuove item → 200
- `DELETE /api/wishlist/items/:id` con id non appartenente all'utente → 404
- `DELETE /api/wishlist` svuota la wishlist → 200

#### Admin::ProductsController
- `POST /api/admin/products` con utente non admin → 403
- `POST /api/admin/products` con dati validi da admin → 201
- `PATCH /api/admin/products/:id` aggiorna prodotto → 200
- `DELETE /api/admin/products/:id` elimina prodotto → 200
- `PATCH /api/admin/products/:id/adjust_quantity` aggiusta stock → 200

#### Admin::OrdersController
- `GET /api/admin/orders` con utente non admin → 403
- `GET /api/admin/orders` con admin → 200, lista tutti gli ordini
- `GET /api/admin/orders/:id` → 200, dettaglio ordine
- `DELETE /api/admin/orders/:id` → 200, ordine eliminato
- `GET /api/admin/stats` → 200, statistiche corrette

---

### Frontend — Service Unit Test (logica reale, non solo creazione)

#### CartService
- `loadCart()` fa GET /api/cart e aggiorna il signal `cart`
- `loadCart()` in caso di 401 non imposta errore
- `addToCart(productId)` fa POST e aggiorna il signal `cart`
- `updateQuantity(itemId, qty)` fa PATCH e aggiorna `cart`
- `removeItem(itemId)` fa DELETE e aggiorna `cart`
- `clearCart()` fa DELETE /api/cart e svuota `cart`
- `resetCart()` imposta il signal a null
- Computed `itemCount` aggiornato dopo ogni operazione
- Computed `isEmpty` true quando items è vuoto

#### WishlistService
- `loadWishlist()` fa GET /api/wishlist e aggiorna il signal
- `addToWishlist(productId)` fa POST e aggiorna il signal
- `removeItem(itemId)` fa DELETE e aggiorna il signal
- `clearWishlist()` fa DELETE /api/wishlist
- `isInWishlist(productId)` restituisce true se il prodotto è nella lista
- `resetWishlist()` imposta il signal a null

#### AuthService
- `login()` salva il token in localStorage e aggiorna i signal
- `logout()` rimuove token e utente da localStorage
- `isLoggedIn` signal aggiornato correttamente dopo login/logout
- `getToken()` restituisce null se non loggato

#### ProductApi
- `list()` fa GET con i parametri corretti nella query string
- `getById(id)` fa GET /api/products/:id

---

### Frontend — Component Test (logica reale)

#### CartPage
- Mostra spinner durante il caricamento
- Mostra messaggio "carrello vuoto" se items è vuoto
- Mostra la lista degli item con titolo, prezzo e quantità
- Click su "+" chiama `incrementQuantity()`
- Click su "-" chiama `decrementQuantity()`
- Click su elimina chiama `removeItem()`
- Click su "Svuota Carrello" chiama `clearCart()` dopo conferma
- Click su "Vai al Checkout" naviga a /checkout
- Mostra il totale aggiornato

#### WishlistPage
- Mostra messaggio "wishlist vuota" se items è vuoto
- Mostra la lista dei prodotti con titolo e prezzo
- Click su "Aggiungi al carrello" chiama `cartService.addToCart()` e poi rimuove dalla wishlist
- Click su elimina chiama `removeItem()`
- Click su "Svuota Wishlist" chiama `clearWishlist()`

#### ProductCard
- Mostra il titolo e prezzo del prodotto
- Mostra il badge con la percentuale di sconto se `originalPrice > price`
- Click su "Carrello" emette evento `add`
- Click su cuore emette evento `addWishlist`
- Icona cuore piena se il prodotto è già in wishlist

#### ProductDetailPage
- Mostra i dati del prodotto (titolo, descrizione, prezzo)
- Mostra "In saldo" se `product.sale === true`
- Click su "Aggiungi al carrello" chiama `cartService.addToCart()`
- Click su bottone wishlist chiama `onToggleWishlist()`
- Bottone wishlist cambia testo/colore se prodotto già in wishlist
- Naviga al prodotto corretto quando si clicca un prodotto simile

#### Header
- Mostra badge carrello con il numero di item
- Badge carrello nascosto se itemCount === 0
- Mostra badge wishlist con il numero di item
- Badge wishlist nascosto se wishlistItemCount === 0
- Click su icona carrello naviga a /cart
- Click su icona wishlist naviga a /wishlist
- Mostra nome utente se loggato
- Mostra bottoni Login/Register se non loggato
- Click su Logout chiama authService.logout() e reindirizza

#### LoginPage / RegisterPage
- Validazione campi obbligatori
- Messaggio di errore su credenziali errate
- Reindirizzamento dopo login/register riuscito

---

### Frontend — Guard Test (logica reale)

#### AuthGuard
- Utente non autenticato → reindirizza a /login
- Utente autenticato → permette l'accesso alla route

#### AdminGuard
- Utente non admin → reindirizza a /products
- Utente admin → permette l'accesso alla route

#### CheckoutGuard
- Carrello vuoto → blocca accesso a /checkout
- Carrello con item → permette l'accesso

---

### Frontend — Interceptor Test

#### AuthInterceptor
- Aggiunge header `Authorization: Bearer <token>` se l'utente è loggato
- Non aggiunge header se non c'è token

#### ErrorInterceptor
- Intercetta errori 401 e gestisce il logout
- Lascia passare altri errori HTTP

---

### E2E (nessuno presente)

- Flusso completo: registrazione → login → aggiunta prodotto al carrello → checkout
- Flusso: login → aggiunta prodotti alla wishlist → spostamento in carrello
- Flusso admin: login admin → creazione prodotto → modifica stock → eliminazione

---

## 2. Property Testing

Il property testing verifica che certe **proprietà invarianti** valgano sempre, generando migliaia di input casuali automaticamente.

### Backend

- `Cart#total()` è sempre uguale a `sum(item.quantity * item.unit_price)` per qualsiasi combinazione di item
- `Cart#item_count()` è sempre uguale a `sum(item.quantity)` per qualsiasi combinazione
- `CartItem` con `quantity` qualsiasi intero <= 0 è sempre invalido
- `Product` con `price` qualsiasi valore <= 0 è sempre invalido
- `Product` con `original_price` qualsiasi valore <= 0 è sempre invalido
- `User` con email qualsiasi stringa non valida è sempre invalido
- `JWT` decodificato con la chiave corretta restituisce sempre lo stesso user_id
- `OrdersController` non diminuisce mai lo stock oltre 0, per qualsiasi quantità ordinata valida
- La somma dei prezzi degli item di un ordine è sempre <= total dell'ordine

### Frontend

- `WishlistService#isInWishlist(id)` è sempre coerente con `items()` (se id è in items, ritorna true)
- `CartService#itemCount()` è sempre uguale a `items().length` (o alla somma delle quantità)
- `CartService#isEmpty()` è sempre `!itemCount() > 0`
- `getDiscountPercentage()` in ProductCard è sempre tra 0 e 100

---

## 3. Mutation Testing

Il mutation testing modifica automaticamente il codice sorgente (es. cambia `>` in `>=`, rimuove un `return`, nega un `if`) e verifica che i test esistenti **falliscano** rilevando la mutazione. Se i test passano ugualmente, significa che non coprono quel comportamento.

### Cosa mutare nel Backend
- Operatori di confronto in validazioni (`> 0` → `>= 0`, `<= 1` → `< 1`)
- Condizioni nei controller (`if cart_item` → `unless cart_item`)
- Calcoli in `Cart#total()` e `Cart#item_count()`
- Logica di autenticazione JWT in `ApplicationController`
- Condizioni di stock in `CartItem` e `OrdersController`

### Cosa mutare nel Frontend
- Condizioni nei signal computed (`=== 0` → `!== 0`)
- Operatori in `getDiscountPercentage()`
- Logica `isInWishlist()` nel WishlistService
- Condizioni nelle guard (`isLoggedIn()` → `!isLoggedIn()`)
- Logica `decrementQuantity()` (soglia `<= 1`)

---

## Strumenti — Si può fare tutto in Ruby/TypeScript?

**Sì, non serve cambiare linguaggio.** Tutto si fa con gem/librerie native degli stessi stack.

### Backend (Ruby)

| Tipo | Strumento | Note |
|------|-----------|-------|
| Testing classico | MiniTest (già usato) o RSpec (già installato) | Nessuna installazione necessaria |
| Property testing | gem `rantly` (con MiniTest) | `gem "rantly"` nel Gemfile |
| Mutation testing | gem `mutant` | `gem "mutant-minitest"` o `gem "mutant-rspec"` |

### Frontend (TypeScript/Angular)

| Tipo | Strumento | Note |
|------|-----------|-------|
| Testing classico | Jasmine/Karma (già configurato) o Vitest (già installato) | Nessuna installazione necessaria |
| Property testing | `fast-check` | `npm install fast-check --save-dev` |
| Mutation testing | Stryker Mutator | `npm install @stryker-mutator/core @stryker-mutator/karma-runner --save-dev` |

### Nota su Stryker
Stryker ha un plugin specifico per Angular (`@stryker-mutator/karma-runner` o `@stryker-mutator/jest-runner`).
È lo strumento di mutation testing più usato nell'ecosistema JavaScript/TypeScript.

### Nota su mutant (Ruby)
`mutant` è il mutation tester standard per Ruby. Funziona meglio con RSpec che con MiniTest,
quindi potrebbe valere la pena migrare i test backend da MiniTest a RSpec (già installato).
