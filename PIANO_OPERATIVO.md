# PIANO OPERATIVO - Progetto Sistemi Web AA 2025/2026

## Informazioni Generali

**Studente:** Mike
**Progetto:** E-Commerce Full-Stack (Frontend Angular + Backend Ruby on Rails)
**Data Analisi:** 30 Dicembre 2025

---

## 1. RIEPILOGO IMPLEMENTAZIONE

Il progetto è stato sviluppato come applicazione full-stack con:
- **Backend:** Ruby on Rails 8.1.1 in modalità API
- **Frontend:** Angular 21 con Standalone Components
- **Database:** SQLite3 (development), PostgreSQL-ready (production)
- **Autenticazione:** JWT con BCrypt
- **UI Framework:** Angular Material 21
- **Deployment:** Docker Compose per orchestrazione completa

---

## 2. FUNZIONALITÀ IMPLEMENTATE

### 2.1 Requisiti Obbligatori - Backend Rails

#### ✅ Gestione Prodotti (Sezione 4.1)

**API Endpoints:**
- ✅ `GET /api/products` - Lista prodotti con funzionalità avanzate:
  - Filtro per titolo (`?title=keyword`) - ricerca LIKE su title e description
  - Filtro per range prezzo (`?min_price=X&max_price=Y`)
  - Ordinamento (`?sort=price_asc|price_desc|date_asc|date_desc`)
  - **Nota:** Paginazione implementata client-side (10 prodotti per pagina)
- ✅ `GET /api/products/:id` - Dettaglio singolo prodotto

**Modello Product:**
- Campi: `id` (string PK), `title`, `description`, `price`, `original_price`, `sale`, `thumbnail`, `tags` (JSON array), `quantity`, `timestamps`
- Validazioni: `price > 0`, `quantity >= 0`
- Metodi helper: `in_stock?`, `out_of_stock?`
- Serializzazione JSON con camelCase

**File di riferimento:**
- Backend: `app/models/product.rb`, `app/controllers/api/products_controller.rb`
- Frontend: `src/app/core/services/product-api.ts`, `src/app/features/product-page/product-page.ts`

#### ✅ Carrello Persistente (Sezione 4.2)

**Modelli:**
- ✅ `Cart` - Associato a user, con campo `expires_at`
- ✅ `CartItem` - Riferimento a Product, quantità e prezzo unitario
- Metodi: `total`, `item_count`, `empty?`, `clear_items`

**API Endpoints:**
- ✅ `GET /api/cart` - Visualizza carrello corrente (auto-creazione se non esiste)
- ✅ `POST /api/cart/items` - Aggiungi prodotto (params: `product_id`, `quantity`)
- ✅ `PATCH /api/cart/items/:id` - Aggiorna quantità
- ✅ `DELETE /api/cart/items/:id` - Rimuovi articolo
- ✅ `DELETE /api/cart` - Svuota intero carrello

**Validazioni:**
- Unicità (cart_id, product_id) - un prodotto una sola volta per carrello
- Quantità > 0
- Validazione stock disponibile: `product_in_stock`, `quantity_available`

**Frontend CartService:**
- ✅ Signal-based state management (Angular 17+ Signals)
- ✅ Auto-inizializzazione al login
- ✅ Aggiornamento backend a ogni modifica (add/update/remove)
- ✅ Computed signals: `itemCount`, `total`, `items`, `isEmpty`
- ✅ Sopravvive al reload della pagina (utente loggato)

**File di riferimento:**
- Backend: `app/models/cart.rb`, `app/models/cart_item.rb`, `app/controllers/api/carts_controller.rb`
- Frontend: `src/app/core/services/cart.service.ts`, `src/app/features/cart-page/cart-page.ts`

#### ✅ Checkout e Ordini (Sezione 4.3)

**Modelli:**
- ✅ `Order` - Campi: `user_id` (nullable per guest), `customer` (JSON: firstName, lastName, email), `address` (JSON: street, city, zip), `total`, `timestamps`
- ✅ `OrderItem` - Riferimento a Product, quantità, prezzo al momento dell'ordine
- ✅ Callback `before_destroy :restore_product_quantities` - Ripristina quantità prodotti eliminando ordine

**API Endpoints:**
- ✅ `POST /api/orders` - Crea ordine da carrello corrente:
  - Validazione stock disponibile
  - Transazione atomica (decrementa quantità, crea OrderItems, svuota carrello)
  - Salva dati customer e address dal form
- ✅ `GET /api/orders` - Lista ordini con discriminazione ruolo:
  - Utente normale: solo propri ordini
  - Admin: tutti gli ordini
  - Filtri supportati: `start_date`, `end_date`, `min_total`, `max_total`
- ✅ `GET /api/orders/:id` - Dettaglio singolo ordine

**Frontend:**
- ✅ `OrderService` con metodi `create()` e `getOrders(filters)`
- ✅ CheckoutPage con Reactive Forms:
  - Sezioni: Customer (firstName, lastName, email) + Address (street, city, zip)
  - Validazioni: email format, zip pattern (5 cifre), minLength sui nomi
  - Privacy checkbox obbligatorio
  - Select metodo spedizione
  - Loading state durante creazione
  - Gestione errori dettagliata per campo
- ✅ Riscontro chiaro: loading, success/error messages (Material Snackbar)
- ✅ Pagina lista ordini (`OrderHistoryPage`) obbligatoria

**File di riferimento:**
- Backend: `app/models/order.rb`, `app/models/order_item.rb`, `app/controllers/api/orders_controller.rb`
- Frontend: `src/app/core/services/order-service.ts`, `src/app/features/checkout-page/checkout-page.ts`, `src/app/features/order-history/order-history.ts`

**Nota sulla Gestione Stato Ordine:**
> Come da decisione progettuale, la gestione degli stati dell'ordine (pending, delivered, shipped, cancelled) **NON** è stata implementata. Gli ordini mantengono solo data di creazione e totale.

#### ✅ Autenticazione Reale (Sezione 4.4)

**Approccio:** Login con credenziali gestito da Rails (custom implementation)

**Modello User:**
- Campi: `email` (unique), `password_digest` (BCrypt), `first_name`, `last_name`, `address`, `role` ('user'|'admin')
- Validazioni: email unica, password minimo 6 caratteri
- Metodi: `admin?`, `full_name`
- Serializzazione JSON senza `password_digest`

**API Endpoints:**
- ✅ `POST /api/register` - Registrazione nuovo utente (assegna ruolo 'user' di default)
- ✅ `POST /api/login` - Login con credenziali:
  - Valida email/password con BCrypt
  - Genera JWT token con payload: `{ user_id, role, exp: 24h }`
  - Algoritmo: HS256
  - Secret: `Rails.application.secret_key_base`
- ⚠️ `POST /api/logout` - **Solo logout frontend** (rimozione token da localStorage)
  - **Nota:** Manca implementazione backend per invalidazione token
- ✅ `GET /api/me` - Profilo utente corrente

**Frontend AuthService:**
- ✅ Pagina login con form reale (email, password)
- ✅ Pagina registrazione con form completo (first_name, last_name, email, address, password, password_confirmation)
- ✅ Validazioni custom: password match validator
- ✅ Storage: Token e User data in `localStorage`
- ✅ Signals: `currentUser`, `isLoggedIn`
- ✅ HttpInterceptor (`authInterceptor`):
  - Attach automatico header `Authorization: Bearer <token>` a tutte le richieste
- ✅ Error Interceptor (`errorInterceptor`):
  - Auto-logout su 401 (token scaduto/invalido)
  - Redirect a /login

**Protezione Risorse:**
- Backend: `require_authentication!`, `require_admin!` in ApplicationController
- Frontend: 3 Guard implementati:
  - ✅ `authGuard` - Verifica autenticazione, redirect /login
  - ✅ `adminGuard` - Verifica autenticazione + ruolo admin
  - ✅ `checkoutGuardGuard` - Verifica autenticazione per checkout

**Rotte Protette:**
- Frontend:
  - `/cart` - authGuard
  - `/checkout` - checkoutGuardGuard
  - `/orders` - authGuard
  - `/admin` - adminGuard
- Backend:
  - Tutti gli endpoint carrello - `require_authentication!`
  - Tutti gli endpoint ordini - `require_authentication!`
  - Tutti gli endpoint `/api/admin/*` - `require_admin!`

**File di riferimento:**
- Backend: `app/models/user.rb`, `app/controllers/api/authentication_controller.rb`, `app/controllers/application_controller.rb`
- Frontend: `src/app/core/services/auth-service.ts`, `src/app/features/login-page/login-page.ts`, `src/app/features/register-page/register-page.ts`, `src/app/core/guard/`, `src/app/core/interceptors/`

### 2.2 Requisiti Tecnici Backend (Sezione 5)

- ✅ Progetto creato come API: `rails new Backend --api`
- ✅ Database relazionale: SQLite3 (development), configurazione PostgreSQL pronta (production)
- ✅ Validazioni di base su tutti i modelli:
  - Product: price > 0, quantity >= 0
  - User: email unique e format, password minimo 6 caratteri
  - CartItem: quantity > 0, unicità (cart_id, product_id), validazione stock
  - Order: validazione campi customer e address
- ✅ Gestione errori coerente:
  - Status HTTP: 200, 201, 400, 401, 403, 404, 422, 500
  - Risposte JSON con messaggi di errore significativi
  - Rescue from ActiveRecord::RecordNotFound → 404
  - Rescue from ActiveRecord::RecordInvalid → 422
- ⚠️ **Test minimi da completare:**
  - Stub presenti: `spec/rails_helper.rb`, `spec/spec_helper.rb`
  - RSpec configurato in Gemfile
  - **Mancanti:** 1 test di modello + 1 test di request/controller

**File di riferimento:**
- `config/application.rb` (API mode)
- `config/database.yml` (SQLite3 + PostgreSQL config)
- `app/models/*.rb` (validazioni)
- `app/controllers/application_controller.rb` (error handling)
- `spec/` (test stubs)

### 2.3 Requisiti Tecnici Frontend (Sezione 6)

- ✅ Nessun dato hardcoded:
  - Prodotti: caricati da API
  - Carrello: caricato da API
  - Ordini: caricati da API
- ✅ Servizi dedicati con responsabilità chiare:
  - `ProductApi` - Gestione prodotti
  - `CartService` - Gestione carrello (signal-based)
  - `OrderService` - Gestione ordini
  - `AuthService` - Autenticazione e stato utente
  - `AdminService` - Funzionalità amministrative
- ✅ Reactive Forms:
  - CheckoutPage: FormGroup con validazioni complesse
  - LoginPage: FormGroup con email/password
  - RegisterPage: FormGroup con custom validator (password match)
  - AdminDashboard: FormGroup per CRUD prodotti
- ✅ HttpClient e HttpInterceptor:
  - `authInterceptor` - Attach token automatico
  - `errorInterceptor` - Gestione centralizzata errori HTTP (401 → logout)
- ✅ Tecnologie aggiuntive:
  - Angular 21 con Standalone Components
  - Angular Material 21 (UI components)
  - TypeScript 5.9
  - RxJS 7.8 (BehaviorSubject, debounceTime, distinctUntilChanged, switchMap)
  - Signals (Angular 17+) per state management reattivo

**File di riferimento:**
- `src/app/core/services/` (tutti i servizi)
- `src/app/features/*/` (componenti con Reactive Forms)
- `src/app/core/interceptors/` (interceptor)

### 2.4 Funzionalità Avanzate Implementate (Sezione 7)

#### ✅ 1. Area Admin per Prodotti (Funzionalità Avanzata #1)

**Backend - Endpoints Admin (protezione `require_admin!`):**
- ✅ `POST /api/admin/products` - Crea nuovo prodotto
  - Parametri: id, title, description, price, original_price, sale, thumbnail, quantity, tags
- ✅ `PUT/PATCH /api/admin/products/:id` - Aggiorna prodotto esistente
- ✅ `DELETE /api/admin/products/:id` - Elimina prodotto
- ✅ `PATCH /api/admin/products/:id/adjust_quantity` - Modifica quantità (±10 per volta)
  - Parametro: `adjustment` (numero intero positivo o negativo)

**Backend - Endpoints Admin per Ordini:**
- ✅ `GET /api/admin/orders` - Lista completa ordini con statistiche:
  - Stats: total_orders, total_revenue, orders_with_user, orders_without_user
  - Ordinamento: data decrescente
- ✅ `GET /api/admin/orders/:id` - Dettaglio completo ordine
- ✅ `DELETE /api/admin/orders/:id` - Elimina ordine (ripristina quantità prodotti)

**Backend - Statistiche Dashboard:**
- ✅ `GET /api/admin/stats` - Statistiche globali:
  - `total_orders`: Conteggio totale ordini
  - `total_revenue`: Somma totale incassi
  - `total_users`: Conteggio utenti (esclusi admin)
  - `total_products`: Conteggio prodotti
  - `low_stock_products`: Prodotti con quantity < 10
  - `recent_orders`: Ultimi 10 ordini con dettagli completi

**Frontend - AdminDashboard Component:**
- ✅ Interfaccia con 3 tab (Material Tabs):

  **Tab 1 - Dashboard Statistiche:**
  - Card con metriche real-time (total orders, revenue, users, products)
  - Alert per prodotti con stock basso (< 10 unità)
  - Lista ultimi 10 ordini recenti con dettagli espansi

  **Tab 2 - Gestione Prodotti:**
  - Tabella completa prodotti (id, title, price, quantity, actions)
  - Form per creazione/modifica prodotti:
    - Campi: id, title, description, price, original_price, sale (checkbox), thumbnail URL, quantity, tags (comma-separated)
    - Validazioni: id/title/price required
  - Operazioni:
    - Crea nuovo prodotto
    - Modifica prodotto esistente (pre-fill form)
    - Elimina prodotto (con conferma)
    - Incrementa quantità (+10)
    - Decrementa quantità (-10)
  - Ricarica automatica lista dopo ogni operazione

  **Tab 3 - Gestione Ordini:**
  - Tabella ordini (id, customer name, total, data)
  - Expansion panels per dettagli ordine:
    - Info cliente e indirizzo
    - Lista completa articoli ordinati
    - Totale ordine
  - Pulsante eliminazione ordine
  - Ricarica statistiche dopo eliminazione

**Protezione:**
- Backend: `before_action :require_admin!` su tutte le rotte admin
- Frontend: `adminGuard` su route `/admin`
- Role-based: Solo utenti con `role='admin'` possono accedere
- Header: Link dashboard admin visibile solo per admin

**File di riferimento:**
- Backend: `app/controllers/api/admin/products_controller.rb`, `app/controllers/api/admin/orders_controller.rb`
- Frontend: `src/app/features/admin-dashboard/admin-dashboard.ts`, `src/app/core/services/admin.service.ts`

#### ✅ 2. Storico Ordini Avanzato (Funzionalità Avanzata #2)

**Pagina "I miei ordini" con funzionalità avanzate:**

**Filtri Implementati:**
- ✅ **Filtro per Data:**
  - Material DatePicker per data inizio (`startDate`)
  - Material DatePicker per data fine (`endDate`)
  - Range di date personalizzabile
- ✅ **Filtro per Totale:**
  - Input numerico per totale minimo (`minTotal`)
  - Input numerico per totale massimo (`maxTotal`)
- ✅ Pulsante "Clear Filters" per reset
- ✅ Chiamata API con parametri: `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&min_total=X&max_total=Y`

**Visualizzazione:**
- ✅ Lista ordinata per data decrescente (più recenti prima)
- ✅ Material Expansion Panels per ogni ordine:
  - Header: ID ordine, data, totale
  - Pannello espandibile con:
    - Informazioni cliente (nome completo, email)
    - Indirizzo di spedizione completo
    - Tabella articoli ordinati (nome prodotto, quantità, prezzo unitario, subtotale)
    - Conteggio articoli totali
    - Totale ordine
- ✅ Formattazione data italiana: `toLocaleDateString('it-IT')`
- ✅ Formattazione prezzi: `toFixed(2)`
- ✅ Stati: loading, error, empty state ("Nessun ordine trovato")

**State Management:**
- Signal-based: `orders`, `loading`, `error`
- Ricarica automatica al cambio filtri

**Protezione:**
- Route guard: `authGuard` su `/orders`
- Solo ordini dell'utente loggato (filtro backend automatico)

**File di riferimento:**
- Frontend: `src/app/features/order-history/order-history.ts`
- Backend: `app/controllers/api/orders_controller.rb` (metodo `index` con filtri)

### 2.5 Funzionalità Aggiuntive Implementate (Oltre le Specifiche)

#### ✅ Filtri e Ricerca Prodotti Avanzati

**Frontend (ProductPage):**
- ✅ Ricerca testuale:
  - Input con debounce 300ms (RxJS)
  - Ricerca real-time durante digitazione
  - `distinctUntilChanged` per evitare richieste duplicate
- ✅ Filtri prezzo:
  - Range min/max con input numerici
  - Validazione client-side
- ✅ Ordinamento:
  - Dropdown con opzioni: price_asc, price_desc, date_asc, date_desc
  - Default: date_desc
- ✅ Paginazione:
  - Material Paginator
  - 10 prodotti per pagina
  - Client-side pagination
- ✅ Reset filtri automatico al cambio pagina

**Backend (ProductsController#index):**
- ✅ Ricerca LIKE su title e description (case-insensitive)
- ✅ Filtro range prezzo con WHERE >= e <=
- ✅ Ordinamento dinamico con `reorder()`

**Performance:**
- `switchMap` per cancellare richieste precedenti
- Debounce per ridurre chiamate API
- Computed signals per totale/itemCount

**File di riferimento:**
- Frontend: `src/app/features/product-page/product-page.ts`
- Backend: `app/controllers/api/products_controller.rb`

#### ✅ Gestione Ordini Guest

- ✅ Campo `user_id` nullable su Order model
- ✅ Salvataggio dati customer e address come JSON
- ✅ Admin può visualizzare e gestire ordini guest
- ✅ Statistiche discriminano orders_with_user e orders_without_user

**File di riferimento:**
- `app/models/order.rb`
- `db/migrate/*_add_user_id_to_orders.rb`

#### ✅ Ripristino Stock Automatico

- ✅ Callback `before_destroy` su Order model
- ✅ Incrementa `product.quantity` quando ordine eliminato
- ✅ Operazione transazionale
- ✅ Logging delle quantità ripristinate

**File di riferimento:**
- `app/models/order.rb:restore_product_quantities`

#### ✅ Sistema Componenti Riutilizzabili

**ProductCard Component:**
- Input: Product (required)
- Output: add (EventEmitter)
- Calcolo sconto percentuale automatico
- Visualizzazione badge "SALE"
- Gestione immagini con fallback
- Click card → dettaglio prodotto

**Header Component:**
- Navigation bar Material Toolbar
- Badge carrello con item count (computed signal)
- Menu dropdown utente autenticato
- Link role-based (admin dashboard per admin)
- Logout button
- Responsive

**File di riferimento:**
- `src/app/shared/product-card/product-card.ts`
- `src/app/shared/header/header.ts`

#### ✅ UX/Accessibilità

- ✅ Loading states su tutte le operazioni async
- ✅ Error messages dettagliati per campo (validazioni)
- ✅ Success/Error notifications con Material Snackbar
- ✅ Confirm dialogs per operazioni distruttive (delete)
- ✅ Empty states ("Nessun prodotto trovato", "Carrello vuoto")
- ✅ Disabled states su bottoni durante loading
- ✅ Formattazione italiana per date e prezzi
- ✅ Responsive design con Angular Material
- ✅ ARIA labels su form fields (Material Form Fields)

### 2.6 Deployment e Configurazione

#### ✅ Docker Compose

**File:** `docker-compose.yml`

**Servizi:**
- ✅ `backend`:
  - Build: `Backend/Dockerfile.dev`
  - Port: 3000:3000
  - Volume: `./Backend:/app` (hot reload)
  - Command: `rails server -b 0.0.0.0`
  - Environment: DATABASE_URL, RAILS_ENV=development
- ✅ `frontend`:
  - Build: `Frontend/Dockerfile`
  - Port: 4200:4200
  - Volume: `./Frontend:/app` (hot reload)
  - Command: `ng serve --host 0.0.0.0`

**Configurazione CORS:**
- ✅ `config/initializers/cors.rb`:
  - Origins: `http://localhost:4200`, `http://127.0.0.1:4200`
  - Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD
  - Headers: Authorization, Content-Type

**Seed Database:**
- ✅ `db/seeds.rb`:
  - ~50 prodotti di esempio
  - 1 utente admin (email: admin@example.com)
  - Tags: Electronics, Clothing, Accessories, Home, Sports, Beauty, Books, Toys

**Istruzioni Startup:**
```bash
docker-compose up --build
# oppure manuale:
cd Backend && bundle install && rails db:migrate && rails db:seed && rails server
cd Frontend && npm install && ng serve
```

**File di riferimento:**
- `docker-compose.yml`
- `Backend/Dockerfile.dev`
- `Frontend/Dockerfile`
- `config/initializers/cors.rb`
- `db/seeds.rb`

### 2.7 Documentazione

- ✅ **README.md** completo con:
  - Descrizione progetto
  - Prerequisiti (Ruby 3.4.7, Rails 8.1.1, Node.js, Angular CLI)
  - Istruzioni passo-passo per setup (manuale e Docker)
  - Configurazione database (migrazioni, seeding)
  - Avvio backend e frontend
  - Credenziali admin di test
  - Struttura progetto
  - API endpoints documentati
  - Funzionalità implementate
  - Tecnologie utilizzate

**File di riferimento:**
- `README.md`

---

## 3. FUNZIONALITÀ MANCANTI/DA COMPLETARE

### 3.1 Test (Requisito Obbligatorio - Sezione 5)

#### ⚠️ Backend RSpec Tests

**Richiesti dalle specifiche:**
- ❌ Almeno 1 test di modello (es. validazione Order o Product)
- ❌ Almeno 1 test di request/controller (es. POST /orders)

**Stato attuale:**
- ✅ RSpec configurato (`spec/rails_helper.rb`, `spec/spec_helper.rb`)
- ✅ Gem 'rspec-rails' in Gemfile
- ❌ Nessun test effettivamente implementato

**Da implementare:**
1. Test modello Product:
   - Validazione price > 0
   - Validazione quantity >= 0
   - Metodi `in_stock?`, `out_of_stock?`
2. Test modello User:
   - Validazione email unica
   - Validazione password minimo 6 caratteri
   - Metodo `admin?`
3. Test modello CartItem:
   - Validazione unicità (cart_id, product_id)
   - Validazione stock disponibile
4. Test request POST /api/orders:
   - Creazione ordine con carrello valido
   - Fallimento con stock insufficiente
   - Svuotamento carrello dopo creazione
5. Test request POST /api/login:
   - Login con credenziali valide
   - Generazione JWT token
   - Fallimento con credenziali invalide

**Comando esecuzione:**
```bash
cd Backend
bundle exec rspec
```

**File da creare:**
- `spec/models/product_spec.rb`
- `spec/models/user_spec.rb`
- `spec/models/cart_item_spec.rb`
- `spec/requests/orders_spec.rb`
- `spec/requests/authentication_spec.rb`

#### ⚠️ Frontend Tests (Angular)

**Richiesti dalle specifiche (opzionale ma apprezzato):**
- Test E2E/integrazione (Funzionalità Avanzata #6):
  - 3-4 Unit test sul backend
  - 2 Unit test su Service Angular
  - 2 Unit test su Component Angular
  - 1-2 scenari end-to-end (login → carrello → checkout → ordine)

**Stato attuale:**
- ✅ File `.spec.ts` presenti (11 file):
  - `cart.service.spec.ts`
  - `auth-service.spec.ts`
  - `product-api.spec.ts`
  - `order-service.spec.ts`
  - `header.spec.ts`
  - `checkout-guard-guard.spec.ts`
  - Ecc.
- ✅ Vitest configurato (`package.json`)
- ❌ Test implementation da completare (stub presenti)

**Da implementare:**
1. Unit test CartService:
   - `addToCart()` aggiorna signal
   - `removeItem()` rimuove articolo
   - `clearCart()` svuota carrello
   - Computed signal `total` calcola somma
2. Unit test AuthService:
   - `login()` salva token e user
   - `logout()` pulisce storage
   - `isAdmin()` verifica ruolo
3. Unit test ProductApi:
   - `list()` chiama endpoint corretto
   - Filtri applicati come query params
4. Component test Header:
   - Badge carrello visualizza item count
   - Link admin visibile solo per admin
5. E2E test (opzionale):
   - Scenario login → aggiungi al carrello → checkout → ordine creato

**Comando esecuzione:**
```bash
cd Frontend
npm test
```

### 3.2 Autenticazione - Logout Backend

#### ⚠️ POST /api/logout - Implementazione Backend

**Stato attuale:**
- ✅ Route `POST /api/logout` definita in `routes.rb`
- ⚠️ Implementazione parziale: solo logout frontend (rimozione token da localStorage)
- ❌ Manca implementazione backend per invalidazione token JWT

**Nota sulla natura JWT:**
I token JWT sono stateless per design. Le opzioni per implementare logout backend sono:

1. **Blacklist Token (consigliato):**
   - Creare model `InvalidatedToken` con campo `jti` (JWT ID)
   - Aggiungere `jti` al payload JWT
   - Al logout: salvare `jti` in blacklist con expiration time
   - Modificare `authenticate_request` per verificare blacklist

2. **Expire Token Immediately:**
   - Mantenere session server-side con Redis
   - Al logout: rimuovere session da Redis

3. **Short-lived Tokens + Refresh Token:**
   - Token principale con exp 15min
   - Refresh token con exp 24h
   - Al logout: invalidare refresh token

**Priorità:** Bassa (il logout frontend funziona correttamente, il token scade comunque dopo 24h)

**File di riferimento:**
- `app/controllers/api/authentication_controller.rb`
- `config/routes.rb`

### 3.3 Funzionalità Avanzate Opzionali (Non Richieste)

Le seguenti funzionalità sono menzionate nelle specifiche come esempi di funzionalità avanzate ma NON sono state implementate (e non sono richieste, avendo già implementato 2 funzionalità avanzate):

#### ❌ Wishlist / Preferiti (Funzionalità Avanzata #3)
- Model Wishlist con relazione user
- Model WishlistItem con relazione product
- Endpoints: GET/POST/DELETE /api/wishlist/items
- Pagina frontend per visualizzare wishlist
- Pulsante "Add to wishlist" su ProductCard

#### ❌ Gestione Codici Sconto / Coupon (Funzionalità Avanzata #4)
- Model Coupon con campi: code, discount_percentage, valid_from, valid_until, max_uses, current_uses
- Validazioni: validità date, numero usi
- Endpoint: POST /api/checkout/apply_coupon
- Input coupon in CheckoutPage
- Ricalcolo totale ordine con sconto applicato

#### ❌ Internazionalizzazione (Funzionalità Avanzata #5)
- Supporto Italiano + Inglese
- Angular i18n o ngx-translate
- Selector lingua nell'interfaccia
- File di traduzione per tutte le stringhe UI
- Persistenza preferenza lingua

#### ❌ Test E2E Completi (Funzionalità Avanzata #6)
- Vedi sezione 3.1 per test parziali presenti

**Nota:** Queste funzionalità NON sono necessarie per il completamento del progetto, essendo già presenti 2 funzionalità avanzate complete (Admin Dashboard + Storico Ordini Avanzato).

---

## 4. ASPETTI DA MIGLIORARE

### 4.1 Qualità del Codice

#### 🔧 Backend

**Da migliorare:**

1. **Error Handling più granulare:**
   - Attualmente: rescue_from generico in ApplicationController
   - Consigliato: error handler specifici per ogni tipo di eccezione
   - Esempio: StockNotAvailableError, PaymentFailedError, ecc.
   - Log strutturati con severity levels

2. **Validazioni più robuste:**
   - Product: validazione formato URL per thumbnail
   - User: validazione formato address (JSON schema)
   - Order: validazione formato email customer
   - CartItem: validazione quantità massima per prodotto

3. **Performance:**
   - Aggiungere indici database per query frequenti:
     - `add_index :orders, :user_id`
     - `add_index :orders, :created_at`
     - `add_index :cart_items, [:cart_id, :product_id], unique: true`
   - Eager loading per evitare N+1 queries:
     - `Order.includes(:order_items, :products)`
     - `Cart.includes(:cart_items, :products)`

4. **Serializzazione API:**
   - Attualmente: metodo `as_json` custom su ogni model
   - Consigliato: usare gem 'jsonapi-serializer' o 'active_model_serializers'
   - Standardizzare formato risposte (JSON:API spec)

5. **Background Jobs:**
   - Email notifica ordine creato (attualmente non implementato)
   - Cleanup carrelli scaduti (campo `expires_at` presente ma non usato)
   - Usare ActiveJob + Sidekiq/DelayedJob

**File di riferimento:**
- `app/controllers/application_controller.rb`
- `app/models/*.rb`
- `db/schema.rb`

#### 🔧 Frontend

**Da migliorare:**

1. **State Management più strutturato:**
   - Attualmente: mix di Signals e BehaviorSubject
   - Consigliato: uniformare a Signals (Angular 17+) oppure usare NgRx/Akita
   - Centralizzare stato globale (user, cart, products)

2. **Error Handling consistente:**
   - Standardizzare formato error messages
   - Component di errore riutilizzabile
   - Retry logic per chiamate API fallite
   - Offline detection e UX

3. **Performance:**
   - Lazy loading dei moduli features
   - OnPush change detection strategy
   - Virtual scrolling per liste lunghe (prodotti, ordini)
   - Image optimization (lazy loading, responsive images)

4. **Validazioni:**
   - Validatori custom riutilizzabili (email, phone, credit card)
   - Error messages centralizzati (i18n-ready)
   - Async validators per unicità email

5. **Testing:**
   - Completare unit test (vedi sezione 3.1)
   - Test di integrazione per flussi critici
   - Test accessibilità (a11y)

**File di riferimento:**
- `src/app/core/services/*.ts`
- `src/app/features/**/*.ts`

### 4.2 Sicurezza

#### 🔒 Backend

**Da implementare:**

1. **Rate Limiting:**
   - Limitare tentativi login (max 5/10 minuti)
   - Limitare API calls per IP (max 100/minuto)
   - Usare gem 'rack-attack'

2. **CORS più restrittivo:**
   - Attualmente: `origins '*'` in development
   - Produzione: specificare domini esatti
   - Limitare headers consentiti

3. **Validazione Input:**
   - Sanitizzazione HTML/SQL injection
   - Validazione tipi parametri (strong params estesi)
   - Whitelist attributi mass-assignment

4. **HTTPS Enforcement:**
   - Force SSL in production
   - Secure cookies
   - HSTS headers

5. **JWT migliorato:**
   - Aggiungere `jti` (JWT ID) per revoca
   - Rotation keys periodica
   - Refresh token pattern
   - Shorter expiration (15min + refresh token)

**File da modificare:**
- `config/initializers/cors.rb`
- `app/controllers/application_controller.rb`
- Nuovo: `config/initializers/rack_attack.rb`

#### 🔒 Frontend

**Da implementare:**

1. **XSS Protection:**
   - Sanitizzazione input utente (DomSanitizer)
   - Content Security Policy headers
   - Evitare `innerHTML` (usare `textContent`)

2. **CSRF Protection:**
   - Token CSRF per form submission
   - Verificare origin headers

3. **Secure Storage:**
   - Evitare localStorage per dati sensibili
   - Usare httpOnly cookies per JWT
   - Criptazione local storage (crypto-js)

4. **Dependency Security:**
   - Audit regolare: `npm audit`
   - Aggiornare dipendenze vulnerabili
   - Renovate bot per updates automatici

**File da modificare:**
- `src/app/core/services/auth-service.ts` (storage)
- `src/index.html` (CSP meta tag)
- `angular.json` (security headers)

### 4.3 UX/Accessibilità

**Da migliorare:**

1. **Accessibilità (a11y):**
   - ARIA labels completi su tutti i form
   - Focus management (keyboard navigation)
   - Screen reader testing
   - Color contrast WCAG AA compliant
   - Skip to content link

2. **Responsive Design:**
   - Test su mobile/tablet
   - Breakpoints per admin dashboard
   - Touch-friendly buttons (min 44x44px)

3. **Performance UX:**
   - Skeleton screens durante loading
   - Optimistic updates (carrello)
   - Offline mode con service worker
   - Progressive Web App (PWA)

4. **Validazione UX:**
   - Inline validation real-time
   - Error messages più user-friendly
   - Success confirmations più evidenti
   - Undo/redo per operazioni distruttive

5. **Immagini Prodotti:**
   - Upload immagini (attualmente solo URL)
   - Image preview in admin
   - Multiple images per prodotto
   - Image optimization (WebP, lazy load)

**File di riferimento:**
- Tutti i componenti frontend
- `src/styles.scss`

### 4.4 Documentazione

**Da aggiungere:**

1. **API Documentation:**
   - Swagger/OpenAPI spec
   - Esempio richieste/risposte
   - Error codes documentati
   - Autenticazione flow diagram

2. **Code Comments:**
   - JSDoc per servizi Angular
   - RDoc per modelli Rails
   - Inline comments per logica complessa

3. **Architecture Document:**
   - Database schema diagram (ERD)
   - Sequenza flow checkout/ordini
   - Authentication flow diagram
   - Deployment architecture

4. **Developer Guide:**
   - Convenzioni codice (linting rules)
   - Git workflow (branch strategy)
   - PR template
   - Changelog

**File da creare:**
- `docs/api-spec.yml` (OpenAPI)
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPER_GUIDE.md`
- `CHANGELOG.md`

### 4.5 DevOps/Deployment

**Da implementare:**

1. **CI/CD Pipeline:**
   - GitHub Actions / GitLab CI
   - Lint + Test su ogni commit
   - Auto-deploy su staging
   - Manual approve per production

2. **Environment Management:**
   - `.env` file per secrets
   - Separate config dev/staging/production
   - Environment variables documentate

3. **Monitoring:**
   - Error tracking (Sentry, Rollbar)
   - Performance monitoring (New Relic, DataDog)
   - Log aggregation (Papertrail, Loggly)
   - Uptime monitoring

4. **Database:**
   - Backup automatici
   - Migration rollback strategy
   - Seeding per staging/production
   - Database connection pooling

5. **Production Deployment:**
   - Heroku / AWS / DigitalOcean config
   - PostgreSQL production database
   - CDN per assets statici
   - Load balancing
   - Auto-scaling

**File da creare:**
- `.github/workflows/ci.yml`
- `.env.example`
- `docs/DEPLOYMENT.md`

---

## 5. STATO FINALE RISPETTO ALLE SPECIFICHE

### Requisiti Obbligatori

| Requisito | Stato | Note |
|-----------|-------|------|
| **4.1 Gestione Prodotti** | ✅ Completo | Filtri, ricerca, paginazione implementati |
| **4.2 Carrello Persistente** | ✅ Completo | Modelli, API, validazioni, frontend |
| **4.3 Checkout e Ordini** | ✅ Completo | Form validato, creazione ordine, lista ordini |
| **4.4 Autenticazione** | ⚠️ Quasi completo | Login/registro funzionanti, logout backend da migliorare |
| **5. Backend Tecnico** | ⚠️ Quasi completo | API, validazioni, errori OK - Test da implementare |
| **6. Frontend Tecnico** | ✅ Completo | Servizi, forms, interceptor, guards |
| **7. Funzionalità Avanzate** | ✅ Completo | 2/1 richieste (Admin + Storico avanzato) |
| **8. Consegna** | ✅ Completo | Repository, README, Docker Compose |

### Riepilogo Percentuale Implementazione

**Requisiti Obbligatori:**
- Gestione Prodotti: **100%** ✅
- Carrello Persistente: **100%** ✅
- Checkout e Ordini: **100%** ✅
- Autenticazione: **95%** ⚠️ (manca solo logout backend)
- Backend Tecnico: **85%** ⚠️ (mancano test)
- Frontend Tecnico: **100%** ✅
- Funzionalità Avanzate: **200%** ✅ (implementate 2 invece di 1)
- Documentazione: **100%** ✅

**Implementazione Totale Requisiti:** **~97%**

**Elementi Mancanti Critici:**
1. Test backend (almeno 2 test richiesti)
2. Logout backend con invalidazione token (opzionale, funziona comunque)

**Elementi Mancanti Opzionali:**
- Wishlist
- Coupon
- Internazionalizzazione
- Test E2E completi
- Payment integration

---

## 6. PIANO D'AZIONE CONSIGLIATO

### Priorità 1 - CRITICA (per completare requisiti minimi)

#### ✅ 1. Implementare Test Backend (Obbligatorio)

**Tempo stimato:** 2-3 ore

**Task:**
1. Creare `spec/models/product_spec.rb`:
   ```ruby
   require 'rails_helper'

   RSpec.describe Product, type: :model do
     it 'is valid with valid attributes' do
       product = Product.new(id: 'test-1', title: 'Test', price: 10, quantity: 5)
       expect(product).to be_valid
     end

     it 'validates price is greater than 0' do
       product = Product.new(price: -10)
       expect(product).not_to be_valid
     end
   end
   ```

2. Creare `spec/requests/orders_spec.rb`:
   ```ruby
   require 'rails_helper'

   RSpec.describe 'Orders API', type: :request do
     let(:user) { User.create!(email: 'test@example.com', password: 'password') }
     let(:token) { JsonWebToken.encode(user_id: user.id, role: user.role) }

     describe 'POST /api/orders' do
       it 'creates an order from cart' do
         # Setup cart with items
         # Post to /api/orders
         # Expect order created, cart emptied
       end
     end
   end
   ```

3. Eseguire: `bundle exec rspec`

**File da creare:**
- `spec/models/product_spec.rb`
- `spec/requests/orders_spec.rb`

### Priorità 2 - ALTA (miglioramenti qualità)

#### 🔧 2. Completare Test Frontend

**Tempo stimato:** 2-3 ore

**Task:**
1. Implementare unit test CartService
2. Implementare unit test AuthService
3. Eseguire: `npm test`

**File da modificare:**
- `src/app/core/services/cart.service.spec.ts`
- `src/app/core/services/auth-service.spec.ts`

#### 🔧 3. Migliorare Logout Backend (Opzionale ma consigliato)

**Tempo stimato:** 1-2 ore

**Task:**
1. Creare model `InvalidatedToken`
2. Aggiungere `jti` a JWT payload
3. Implementare `logout` in AuthenticationController
4. Verificare `jti` in blacklist durante `authenticate_request`

**File da modificare:**
- `app/controllers/api/authentication_controller.rb`
- `app/controllers/application_controller.rb`
- Nuovo: `app/models/invalidated_token.rb`
- Nuovo: `db/migrate/*_create_invalidated_tokens.rb`

### Priorità 3 - MEDIA (documentazione e sicurezza)

#### 📚 4. Documentare API con Swagger

**Tempo stimato:** 2-3 ore

**Task:**
1. Installare gem 'rswag'
2. Generare spec OpenAPI
3. Documentare tutti gli endpoint con esempi

**File da creare:**
- `swagger/v1/swagger.yaml`
- `config/initializers/rswag.rb`

#### 🔒 5. Implementare Rate Limiting

**Tempo stimato:** 1 ora

**Task:**
1. Installare gem 'rack-attack'
2. Configurare limiti login (5 tentativi/10min)
3. Configurare limiti API (100 req/min)

**File da creare:**
- `config/initializers/rack_attack.rb`

### Priorità 4 - BASSA (funzionalità extra)

#### ➕ 6. Aggiungere Wishlist (Funzionalità Avanzata Extra)

**Tempo stimato:** 4-6 ore

**Task:**
1. Creare models Wishlist, WishlistItem
2. Creare API endpoints
3. Creare WishlistService frontend
4. Creare WishlistPage component

#### ➕ 7. Implementare Internazionalizzazione

**Tempo stimato:** 3-4 ore

**Task:**
1. Setup ngx-translate
2. Creare file traduzioni it.json, en.json
3. Aggiungere language selector in Header

---

## 7. CONCLUSIONI

### Punti di Forza

✅ **Architettura Solida:**
- Progetto full-stack ben strutturato con separazione frontend/backend
- Modelli di dominio ben definiti (User, Product, Cart, Order con relazioni corrette)
- API REST coerenti e ben organizzate
- Autenticazione JWT robusta con role-based access control

✅ **Funzionalità Complete:**
- Tutte le funzionalità obbligatorie implementate e funzionanti
- 2 funzionalità avanzate complete (Admin Dashboard ricchissima + Storico Ordini con filtri)
- Funzionalità extra oltre le specifiche (ordini guest, ripristino stock, filtri avanzati prodotti)

✅ **Frontend Moderno:**
- Angular 21 con Standalone Components (architettura moderna)
- Signal-based state management (Angular 17+ best practices)
- Material Design UI (professionale e responsive)
- Reactive Forms con validazioni complesse
- Guard e Interceptor per sicurezza

✅ **Backend Robusto:**
- Rails 8 API mode
- Validazioni modelli complete
- Gestione errori HTTP coerente
- CORS configurato correttamente
- Seeding database con dati realistici

✅ **DevOps:**
- Docker Compose per deployment facile
- Documentazione completa in README
- Environment configurabile

### Aree di Miglioramento

⚠️ **Test (Critico):**
- Test backend da implementare (requisito minimo mancante)
- Test frontend da completare

⚠️ **Logout Backend:**
- Implementazione parziale (funziona frontend, ma token non invalidato server-side)

🔧 **Qualità Codice:**
- Error handling più granulare
- Performance optimization (indici DB, eager loading)
- State management più uniforme

🔒 **Sicurezza:**
- Rate limiting da implementare
- CORS più restrittivo in produzione
- JWT refresh token pattern

📚 **Documentazione:**
- API documentation (Swagger)
- Architecture diagrams
- Developer guide

### Valutazione Finale Stimata

**Secondo i criteri del PDF (pag. 8):**

1. **Backend Rails** (max 10 punti): **9/10**
   - API REST ✅
   - Modello dati ✅
   - Validazioni ✅
   - Gestione errori ✅
   - Test minimi ❌ (-1 punto)

2. **Frontend Angular** (max 10 punti): **10/10**
   - Integrazione API ✅
   - Gestione carrello/ordini ✅
   - Checkout funzionante ✅
   - Nessun dato hardcoded ✅

3. **Funzionalità Avanzate** (max 5 punti): **5/5 + Bonus**
   - Admin Dashboard completa ✅
   - Storico ordini avanzato ✅
   - (2 funzionalità = bonus per 30 e lode)

4. **Qualità Complessiva** (max 2 punti): **2/2**
   - Struttura codice ✅
   - UX/a11y minima ✅
   - Repository ordinato ✅
   - Documentazione ✅

**Totale Stimato:** **26/27 punti** (+ bonus funzionalità extra)
**Voto Indicativo:** **29-30/30** (con possibilità di 30 e lode se test completati)

### Raccomandazioni Finali

**Per raggiungere il massimo voto:**
1. ✅ **PRIORITÀ ASSOLUTA:** Implementare i 2 test minimi backend richiesti (1-2 ore)
2. 🔧 Completare test frontend (2-3 ore)
3. 📚 Documentare API con Swagger (opzionale ma apprezzato)

**Il progetto è già molto completo e ben fatto.** Con l'aggiunta dei test minimi richiesti, soddisfa pienamente tutti i requisiti delle specifiche e supera le aspettative con 2 funzionalità avanzate invece di 1.

---

**Fine Piano Operativo**

*Documento generato il 30 Dicembre 2025*
