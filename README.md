# Progetto_Sistemi_Web e Ingegneria del Software Avanzata
# E-Commerce Full-Stack - Progetto Sistemi Web 2025/2026

Applicazione e-commerce completa sviluppata con Angular (frontend) e Ruby on Rails (backend API).

## Tecnologie Utilizzate

### Backend
- Ruby 3.4.7
- Rails 8.1.1 (API mode)
- SQLite3 (development), PostgreSQL (production recommended)
- JWT per autenticazione
- Pagy per paginazione
- Minitest per i test, SimpleCov per la coverage, Rantly per i test property-based

### Frontend
- Angular 21
- TypeScript 5.9
- Angular Material 21
- RxJS con Signals
- Vitest per i test unitari (con coverage v8)

### DevOps
- Docker + Docker Compose per l'ambiente di sviluppo
- GitHub Actions per la pipeline CI

## Prerequisiti Software

### Opzione 1: Con Docker (Raccomandato)

- **Docker:** versione 20.x o superiore
- **Docker Compose:** versione 2.x o superiore

Verifica versioni:
```bash
docker --version          # Docker version 20.x.x o superiore
docker compose version    # Docker Compose version 2.x.x o superiore
```

### Opzione 2: Installazione Manuale

- **Ruby:** versione 3.4.7 
- **Rails:** versione 8.1.1 (`gem install rails -v 8.1.1`)
- **Node.js:** versione 20.x o superiore
- **npm:** versione 10.x o superiore
- **Angular CLI:** versione 21.x (`npm install -g @angular/cli@21`)
- **SQLite3:** (generalmente già incluso in macOS/Linux)

Verifica versioni:
```bash
ruby -v        # 3.4.7
rails -v       # 8.1.1
node -v        # v20.x.x
npm -v         # 10.x.x
ng version     # 21.x.x
```

## Setup Progetto

### 1. Clone Repository

```bash
git clone https://github.com/MiKee-1/Progetto_Sistemi_Web_Ing_Sw_Adv
cd Progetto_Sistemi_Web_Ing_Sw_Adv
```

### 2. Avvio con Docker

#### Step 1: Setup iniziale (solo la prima volta)

```bash
# Build e avvio dei container in background
docker compose up -d --build

# Crea il database e le tabelle per il backend
docker exec progetto_sistemi_web-backend-1 bin/rails db:create
docker exec progetto_sistemi_web-backend-1 bin/rails db:migrate
docker exec progetto_sistemi_web-backend-1 bin/rails db:seed

# Installa le dipendenze del frontend
docker exec progetto_sistemi_web-frontend-1 npm install

# Ferma i container
docker compose down
```

Il seed crea:
- **1 Admin:** `admin@example.com` / `password123`
- **2 Utenti:** `user@example.com` / `password123`, `user2@example.com` / `password123`
- **~50 Prodotti** importati da `Frontend/shop-mock-api/db.json`

#### Step 2: Avvio applicazione

```bash
# Build delle immagini e avvio dei container (in modalità attached per vedere i log)
docker compose up --build
```

**Nota:** Al primo avvio, attendi che Angular compili completamente (vedrai "Compiled successfully" nei log).

Questo comando:
- Compila le immagini Docker per backend e frontend
- Avvia i container in modalità attached (vedrai i log)
- Il backend sarà disponibile su: http://localhost:3000
- Il frontend sarà disponibile su: http://localhost:4200

#### Step 3: Verifica installazione

Apri il browser su http://localhost:4200 - dovresti vedere la homepage con i prodotti caricati.

#### Comandi Docker Utili

```bash
# Avvio container in background (dopo il primo build)
docker compose up -d

# Avvio con rebuild delle immagini
docker compose up --build

# Stop dei container
docker compose down

# Stop e rimuovi volumi
docker compose down -v

# Visualizza log
docker compose logs -f

# Riavvia un singolo servizio
docker compose restart backend
docker compose restart frontend

# Accedi alla shell del container backend
docker exec -it progetto_sistemi_web-backend-1 bash

# Esegui comandi Rails
docker exec progetto_sistemi_web-backend-1 bin/rails console
docker exec progetto_sistemi_web-backend-1 bin/rails routes
docker exec progetto_sistemi_web-backend-1 bin/rails db:reset

# Esegui comandi npm nel frontend
docker exec progetto_sistemi_web-frontend-1 npm install
docker exec progetto_sistemi_web-frontend-1 npm run build
```


#### Comando per aggiungere un ordine da console ruby:
```ruby
product = Product.first  # oppure Product.find("id-del-prodotto")
order = Order.create!(
  customer: { "firstName" => "Mario", "lastName" => "Rossi", "email" => "mario@test.com" },
  address:  { "street" => "Via Roma 1", "city" => "Milano", "zip" => "20100" },
  total:    product.price,
  order_items_attributes: [
    { product_id: product.id, quantity: 1, unit_price: product.price }
  ]
)

order.update_column(:created_at, 3.days.ago)
```

---

## Utilizzo Applicazione

### Utente Normale

1. **Registrazione:**
   - Vai su http://localhost:4200/register
   - Compila form: nome, cognome, email, indirizzo, password

2. **Login:**
   - Vai su http://localhost:4200/login
   - Credenziali demo: `user@example.com` / `password123`

3. **Shopping:**
   - Browse prodotti: filtra per titolo, prezzo, ordina
   - Aggiungi al carrello
   - Visualizza carrello: modifica quantità, rimuovi articoli
   - Checkout: compila dati spedizione, conferma ordine
   - Visualizza storico ordini

### Amministratore

1. **Login Admin:**
   - Email: `admin@example.com`
   - Password: `password123`

2. **Dashboard Admin:**
   - Statistiche: ordini totali, revenue, utenti, prodotti, low stock
   - Gestione Prodotti: CRUD completo (crea, modifica, elimina)
   - Gestione Inventario: increment/decrement quantità
   - Visualizzazione Ordini: tutti gli ordini con dettagli
   - Cancellazione Ordini

## Architettura Applicazione

### Modelli Database

```
users
├── id (integer)
├── email (string, unique)
├── password_digest (string) - BCrypt hash
├── first_name (string)
├── last_name (string)
├── address (string)
├── role (string: 'user' | 'admin')
└── timestamps

products
├── id (string, primary key)
├── title (string)
├── description (text)
├── price (decimal)
├── original_price (decimal)
├── sale (boolean)
├── thumbnail (string - URL)
├── tags (json)
├── quantity (integer)
└── timestamps

carts
├── id (integer)
├── user_id (integer, foreign key)
├── expires_at (datetime)
└── timestamps

cart_items
├── id (integer)
├── cart_id (integer, foreign key)
├── product_id (string, foreign key)
├── quantity (integer)
├── unit_price (decimal)
└── timestamps
└── UNIQUE INDEX (cart_id, product_id)

orders
├── id (integer)
├── user_id (integer, foreign key, nullable)
├── customer (json: {firstName, lastName, email})
├── address (json: {street, city, zip})
├── total (decimal)
└── timestamps

order_items
├── id (integer)
├── order_id (integer, foreign key)
├── product_id (string, foreign key)
├── quantity (integer)
├── unit_price (decimal)
└── timestamps
```

## Funzionalità Avanzate Implementate

### 1. Area Amministratore 

Dashboard completa con:
- **Statistiche Real-time:**
  - Totale ordini e revenue
  - Conteggio utenti e prodotti
  - Alert prodotti con stock < 10
  - Ultimi 10 ordini recenti

- **Gestione Prodotti CRUD:**
  - Creazione nuovi prodotti
  - Modifica prodotti esistenti
  - Eliminazione prodotti
  - Aggiustamento inventario (+10/-10)

- **Gestione Ordini:**
  - Visualizzazione tutti gli ordini (anche guest)
  - Dettagli completi (customer, indirizzo, prodotti)
  - Cancellazione ordini

- **Protezione:**
  - Backend: `before_action :require_admin!`
  - Frontend: `adminGuard` su route `/admin`

### 2. Filtri avanzati nello storico ordini

Possibilità di eseguire ricerche degli ordini con filtri personalizzati
- **Ricerca del prodotto per nome**
   - possibilità di cercare uno specifico prodotto per ogni ordine
- **Ricerca per data (inizio e fine)**
   - possibilità di vedere gli ordini a partire da/entro una tale data
- **Spesa minima e massima effettuata nell'ordine**
   - possibilità di vedere gli ordini dove si ha speso almeno/al massimo una somma di denaro

## Testing

### Backend — Minitest + SimpleCov + Rantly (PBT)

La suite backend conta **190 test** e copre i modelli (validazioni,
relazioni, callback, serializzazione) e i controller API (test di
integrazione sull'intero ciclo richiesta → risposta, autenticazione JWT
inclusa). La suite ha anche trovato e portato alla correzione di un bug
reale: `DELETE /api/wishlist/items/:id` per un utente senza wishlist
rispondeva 500 invece di 404.

```bash
cd Backend

# Tutta la suite (in parallelo, default)
bin/rails test

# Solo modelli o solo controller
bin/rails test:models
bin/rails test:controllers

# Con Docker
docker exec progetto_sistemi_web-backend-1 bin/rails test
```

Al termine SimpleCov genera il report HTML in `Backend/coverage/`
(aprire `index.html`), con line e branch coverage. I risultati dei
worker paralleli vengono uniti automaticamente tramite
`parallelize_setup` / `parallelize_teardown` nel `test_helper.rb`.

**Property-based testing (Rantly).** Oltre ai test a esempi, la suite
include test property-based: l'helper `property_of` (definito in
`test_helper.rb`) genera decine di input casuali per ogni proprietà e
verifica invarianti che devono valere per *qualsiasi* valore, non solo
per i casi scelti a mano. Le proprietà coperte: `Cart#total` e
`Cart#item_count` coincidono con le somme su contenuti arbitrari del
carrello, la validazione di `Product#price` riflette sempre il confine
dello zero, e il roundtrip JWT (encode → decode) preserva i claim e
rifiuta firme con chiave errata.

### Frontend — Vitest + coverage v8

La suite frontend conta **193 test in 24 file**: ogni componente e
servizio ha test reali (auth, carrello, checkout con Reactive Forms,
wishlist, storico ordini con filtri, dashboard admin con CRUD prodotti,
guard, interceptor).

```bash
cd Frontend

# Suite unitaria (watch mode)
npm test

# Una sola esecuzione + report di coverage
npm run test:coverage
```

Il report HTML di coverage finisce in `Frontend/coverage/flowboard/`
(aprire `index.html`).

## CI/CD

La pipeline CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
gira su ogni Pull Request e su ogni push su `main`. Usa `paths-filter`
per saltare i job non pertinenti al diff. I job sono:

| Job | Cosa fa |
|---|---|
| `changes` | Path filter: stabilisce quali parti del repo sono cambiate |
| `backend-lint` | Rubocop su tutto il codice backend (0 offense) |
| `backend-security` | Brakeman (SAST) + bundler-audit (CVE sulle gem) |
| `backend-test` | Minitest + upload del report SimpleCov come artefatto |
| `frontend-test` | Vitest con coverage + upload del report come artefatto |
| `docker-build` | Build (senza push) di entrambe le immagini Docker — sanity check |
| `ci-success` | Gate finale per le branch protection rules |

I report di coverage restano scaricabili come artefatti della run per
7 giorni.

Il processo di sviluppo segue la regola: branch → PR → CI verde → merge
(mai push diretti su `main`), con messaggi in stile
[Conventional Commits](https://www.conventionalcommits.org/).


## Troubleshooting

### I prodotti non vengono mostrati

**Causa:** Il database non è stato popolato con il seed.

**Soluzione:**
```bash
# Con Docker
docker exec progetto_sistemi_web-backend-1 bin/rails db:seed

# Verifica che i prodotti siano stati caricati
docker exec progetto_sistemi_web-backend-1 bin/rails runner "puts Product.count"

# Manuale
cd Backend
rails db:seed
```

### Errore "Mock data file not found"

**Causa:** Il container backend non riesce a trovare il file `Frontend/shop-mock-api/db.json`.

**Soluzione:** Verifica che il file esista e che il volume sia montato correttamente in `docker-compose.yml`:
```yaml
volumes:
  - ./Backend:/rails
  - ./Frontend:/Frontend:ro  # Questa riga deve essere presente
```

Se hai modificato il `docker-compose.yml`, riavvia i container:
```bash
docker compose down
docker compose up --build
```

### Il frontend non si connette al backend

**Causa:** Problemi di CORS o backend non raggiungibile.

**Soluzione:**
1. Verifica che il backend sia in esecuzione su http://localhost:3000
2. Controlla la configurazione in `Frontend/src/app/core/services/product-api.ts`
3. Verifica CORS in `Backend/config/initializers/cors.rb`

### Permessi negati su Docker

**Causa:** File creati dal container Docker potrebbero avere permessi diversi dall'utente host.

**Soluzione:**
La configurazione Docker è stata ottimizzata per gestire automaticamente i permessi. Se riscontri ancora problemi:

```bash
# Ferma i container
docker compose down

# Ripristina proprietà corretta sui file host
sudo chown -R $USER:$USER Backend Frontend

# Rimuovi i volumi e ricrea
docker compose down -v
docker compose up --build
```

Se i problemi persistono, puoi modificare i permessi dei file locali:
```bash
chmod -R 755 Backend Frontend
```

### Backend "già in esecuzione"
Può capitare di chiudere docker forzatamente premendo "ctrl+c" due volte di fila.
Consiglio di terminare i container **premendo UNA volta ctrl+c**, oppure con:
```bash
docker compose down
```

Se dovesse accadere un errore simile:
```bash
backend-1   | => Booting Puma
backend-1   | => Rails 8.1.1 application starting in development 
backend-1   | => Run `bin/rails server --help` for more startup options
backend-1   | A server is already running (pid: 1, file: /rails/tmp/pids/server.pid).
backend-1   | Exiting
backend-1 exited with code 1
```
Bisognerà eliminare il file server.pid
```bash
#terminiamo i container
docker compose down

#eliminiamo il file pid contenente il backend "fantasma"
sudo rm Backend/tmp/pids/server.pid

#riavviamo docker
docker compose up --build
````
