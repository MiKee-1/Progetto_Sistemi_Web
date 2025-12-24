# PIANO OPERATIVO - Progetto Sistemi Web 2025/2026

**Studente:** [Nome Cognome]
**Data creazione piano:** 24 Dicembre 2025
**Obiettivo:** Completare il progetto e-commerce full-stack secondo le specifiche del corso

---

## INDICE

1. [Stato Attuale del Progetto](#1-stato-attuale-del-progetto)
2. [Analisi Gap vs Specifiche](#2-analisi-gap-vs-specifiche)
3. [Funzionalità Mancanti](#3-funzionalità-mancanti)
4. [Funzionalità da Migliorare](#4-funzionalità-da-migliorare)
5. [Funzionalità Avanzate](#5-funzionalità-avanzate)
6. [Testing](#6-testing)
7. [Documentazione](#7-documentazione)
8. [Piano di Implementazione](#8-piano-di-implementazione)
9. [Timeline Suggerita](#9-timeline-suggerita)
10. [Checklist Finale](#10-checklist-finale)

---

## 1. STATO ATTUALE DEL PROGETTO

### ✅ GIÀ IMPLEMENTATO

#### Backend Rails (API)
- ✅ Modelli completi: Product, User, Cart, CartItem, Order, OrderItem
- ✅ Validazioni su tutti i modelli
- ✅ Autenticazione JWT custom (non mock)
- ✅ Endpoints prodotti: GET /products, GET /products/:id
- ✅ Endpoints carrello: GET/POST/PATCH/DELETE /cart e /cart/items
- ✅ Endpoints ordini: GET/POST /orders
- ✅ Endpoints autenticazione: POST /register, /login, GET /me
- ✅ Area admin completa: CRUD prodotti, gestione inventario, visualizzazione/cancellazione ordini
- ✅ CORS configurato
- ✅ Gestione errori con status HTTP appropriati
- ✅ Database SQLite configurato
- ✅ Seeds con dati demo (admin, utenti, prodotti)

#### Frontend Angular
- ✅ Servizi dedicati: AuthService, CartService, ProductApi, OrderService, AdminService
- ✅ Autenticazione reale (NO mock) con JWT
- ✅ HttpInterceptor per token automatico
- ✅ Guards: adminGuard, checkoutGuardGuard
- ✅ Reactive Forms: checkout, login, register, admin prodotti
- ✅ Pagine complete: products, product-detail, cart, checkout, login, register, admin-dashboard
- ✅ Carrello persistente (backend-based, NO localStorage per dati)
- ✅ Gestione stock prodotti
- ✅ Filtri prodotti: titolo (debounced), prezzo min/max
- ✅ Ordinamento: prezzo, data
- ✅ Paginazione frontend (10 item/pagina)
- ✅ Area admin con statistiche e gestione completa
- ✅ NO dati hardcoded (tutto da API)

### ⚠️ PUNTI DI ATTENZIONE

#### Implementazioni Parziali
- ⚠️ Filtri prodotti solo frontend (paginazione non backend-based)
- ⚠️ Nessun filtro per categoria/tag implementato
- ⚠️ Database SQLite (ok per sviluppo, da documentare per produzione)
- ⚠️ Manca gestione stati ordini (pending, shipped, delivered)
- ⚠️ Nessun endpoint GET /orders/:id per utente normale

#### Completamente Assenti
- ❌ Test (backend e frontend)
- ❌ Documentazione completa (README minimalista)
- ❌ Docker Compose
- ❌ File ARCHITETTURA.md
- ❌ Funzionalità avanzata implementata (oltre area admin)

---

## 2. ANALISI GAP VS SPECIFICHE

### 📋 REQUISITI FUNZIONALI OBBLIGATORI

| Requisito | Stato | Note |
|-----------|-------|------|
| **4.1 Gestione Prodotti** | ✅ COMPLETO | Backend: GET /products, GET /products/:id. Frontend: ProductService reale. MANCA: filtro categoria/tag backend, ricerca testuale backend, paginazione backend |
| **4.2 Carrello Persistente** | ✅ COMPLETO | Backend: modelli Cart/CartItem, endpoints completi. Frontend: CartService reale, persistenza OK |
| **4.3 Checkout e Ordini** | ⚠️ QUASI COMPLETO | Backend: modelli Order/OrderItem, POST /orders OK. Frontend: form reattivo OK. MANCA: GET /orders/:id per utente, gestione stati ordine |
| **4.4 Autenticazione** | ✅ COMPLETO | JWT custom, login/register/logout, guard, interceptor. Protezione checkout e orders OK |

### 📋 REQUISITI TECNICI BACKEND

| Requisito | Stato | Note |
|-----------|-------|------|
| API mode Rails | ✅ OK | Progetto configurato come API |
| Database relazionale | ✅ OK | SQLite (da documentare limiti per produzione) |
| Validazioni modelli | ✅ OK | Tutti i modelli hanno validazioni complete |
| Gestione errori | ✅ OK | Status HTTP corretti, JSON con messaggi |
| Test minimo | ❌ MANCANTE | RSpec configurato ma NESSUN test scritto |

### 📋 REQUISITI TECNICI FRONTEND

| Requisito | Stato | Note |
|-----------|-------|------|
| NO dati hardcoded | ✅ OK | Tutto da API backend |
| Servizi dedicati | ✅ OK | ProductApi, CartService, OrderService, AuthService |
| Reactive Forms | ✅ OK | Checkout, login, register, admin prodotti |
| HttpInterceptor | ✅ OK | Token JWT automatico |
| Guard | ✅ OK | adminGuard, checkoutGuardGuard |

### 📋 FUNZIONALITÀ AVANZATE

| Opzione | Stato | Complessità | Raccomandazione |
|---------|-------|-------------|-----------------|
| Area Admin | ✅ GIÀ PRESENTE | Alta | Come funzionalità primaria |
| Storico ordini avanzato | ⚠️ BASE PRESENTE | Media | Migliorabile come bonus |
| **Wishlist** | ❌ DA FARE | Media | ⭐ CONSIGLIATA |
| Codici sconto | ❌ DA FARE | Media-Alta | Opzionale |
| **Internazionalizzazione** | ❌ DA FARE | Media | ⭐ CONSIGLIATA |
| Test E2E | ❌ DA FARE | Alta | Opzionale (bonus) |

---

## 3. FUNZIONALITÀ MANCANTI

### 🔴 PRIORITÀ ALTA (Obbligatorio)

#### 3.1 Testing (Backend)

**Cosa mancano:**
- ❌ Test modello Product (validazioni)
- ❌ Test modello Order (validazioni, creazione)
- ❌ Test request POST /api/orders (endpoint significativo)
- ❌ Test request POST /api/cart/items

**Specifiche richiedono:**
- Almeno 1 test di modello
- Almeno 1 test di request/controller

**Azione richiesta:**
```ruby
# spec/models/product_spec.rb
describe Product do
  it "validates presence of title"
  it "validates price is positive"
  it "validates quantity is non-negative"
end

# spec/models/order_spec.rb
describe Order do
  it "validates total is positive"
  it "creates order items from cart"
end

# spec/requests/orders_spec.rb
describe "POST /api/orders" do
  it "creates order from cart and clears cart"
  it "returns 401 if not authenticated"
  it "returns 422 if cart is empty"
end

# spec/requests/cart_items_spec.rb
describe "POST /api/cart/items" do
  it "adds product to cart"
  it "validates product stock availability"
end
```

#### 3.2 Testing (Frontend)

**Cosa manca:**
- ❌ Nessun test unitario su servizi
- ❌ Nessun test unitario su componenti
- ❌ Nessun test E2E

**Specifiche richiedono (se scelta come funzionalità avanzata):**
- 2 Unit test su Service Angular
- 2 Unit test su Component Angular

**Azione richiesta:**
```typescript
// src/app/core/services/cart.service.spec.ts
describe('CartService', () => {
  it('should add item to cart', ...)
  it('should calculate total correctly', ...)
});

// src/app/features/products/product-page/product-page.spec.ts
describe('ProductPage', () => {
  it('should load products on init', ...)
  it('should filter products by search', ...)
});
```

#### 3.3 Documentazione

**Cosa manca:**
- ❌ README completo con istruzioni setup
- ❌ File ARCHITETTURA.md
- ❌ Documentazione API endpoints
- ❌ Istruzioni per database setup/seeding

**Specifiche richiedono:**
1. **README.md** con:
   - Prerequisiti (Ruby 3.4.7, Rails 8.1.1, Node, Angular CLI 21, SQLite)
   - Setup database (rails db:create db:migrate db:seed)
   - Avvio backend (rails server)
   - Avvio frontend (ng serve)
   - Credenziali demo (admin, utenti test)

2. **ARCHITETTURA.md** (o sezione README) con:
   - Modelli dominio (Product, User, Cart, Order, ecc.)
   - Flusso login → carrello → checkout → ordine
   - Funzionalità avanzate implementate
   - Scelte tecnologiche (JWT, SQLite, Angular Signals)

#### 3.4 Miglioramenti Backend per Specifiche

**Filtro categoria/tag o ricerca testuale**

Specifiche richiedono "almeno una" capacità tra:
- Filtro per categoria/tag (?tag=...)
- Ricerca testuale (?q=...)
- Paginazione backend (?page=...&per_page=...)

**Attualmente:** filtri solo frontend, paginazione solo frontend

**Azione richiesta:**
```ruby
# app/controllers/api/products_controller.rb
def index
  products = Product.all

  # Filtro per tag
  if params[:tag].present?
    products = products.where("tags LIKE ?", "%#{params[:tag]}%")
  end

  # Ricerca testuale
  if params[:q].present?
    products = products.where("title LIKE ? OR description LIKE ?",
                              "%#{params[:q]}%", "%#{params[:q]}%")
  end

  # Paginazione
  page = params[:page]&.to_i || 1
  per_page = params[:per_page]&.to_i || 10

  products = products.page(page).per(per_page)

  render json: products
end
```

**Frontend:** aggiornare ProductApi per supportare query params

#### 3.5 Endpoint Ordini per Utente

**Cosa manca:**
- GET /api/orders/:id (dettaglio ordine specifico per utente)

**Attualmente:**
- GET /api/orders (lista ordini) esiste
- Ma dettaglio ordine specifico potrebbe non essere accessibile a utente normale

**Azione richiesta:**
```ruby
# app/controllers/api/orders_controller.rb
def show
  if current_user.admin?
    order = Order.includes(:order_items, :products).find(params[:id])
  else
    # Utente normale può vedere solo i propri ordini
    order = current_user.orders.includes(:order_items, :products).find(params[:id])
  end

  render json: order.as_json, status: :ok
rescue ActiveRecord::RecordNotFound
  render json: { error: 'Order not found' }, status: :not_found
end
```

**Routes:**
```ruby
# config/routes.rb
resources :orders, only: [:index, :create, :show] # aggiungere :show
```

---

## 4. FUNZIONALITÀ DA MIGLIORARE

### 🟡 PRIORITÀ MEDIA (Miglioramenti Qualità)

#### 4.1 Gestione Stati Ordini

**Problema attuale:**
- Ordini hanno solo campo `total`, `created_at`
- Nessun campo `status` (pending, processing, shipped, delivered, cancelled)

**Miglioramento suggerito:**
```ruby
# Migration
rails generate migration AddStatusToOrders status:string

# db/migrate/xxxxx_add_status_to_orders.rb
class AddStatusToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :status, :string, default: 'pending'
    add_index :orders, :status
  end
end

# app/models/order.rb
class Order < ApplicationRecord
  STATUSES = %w[pending processing shipped delivered cancelled].freeze

  validates :status, presence: true, inclusion: { in: STATUSES }

  # State machine methods
  def pending? = status == 'pending'
  def can_ship? = %w[pending processing].include?(status)
  # ...
end
```

**Frontend:** Visualizzare badge colorati per stati

#### 4.2 Database per Produzione

**Problema attuale:**
- SQLite non adatto a produzione (file-based, no concurrency)

**Azione suggerita:**
- Documentare nel README che SQLite è solo per sviluppo
- Fornire configurazione PostgreSQL per produzione:

```yaml
# config/database.yml
production:
  adapter: postgresql
  encoding: unicode
  database: progetto_sistemi_web_production
  pool: 5
  username: <%= ENV['DB_USERNAME'] %>
  password: <%= ENV['DB_PASSWORD'] %>
  host: <%= ENV['DB_HOST'] %>
```

**NON è necessario implementare PostgreSQL**, solo documentare l'opzione.

#### 4.3 Docker Compose

**Problema attuale:**
- Nessun docker-compose.yml
- Setup manuale richiesto (backend + frontend separati)

**Miglioramento opzionale ma apprezzato:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./Backend
    ports:
      - "3000:3000"
    volumes:
      - ./Backend:/app
    environment:
      - RAILS_ENV=development
      - DATABASE_URL=sqlite3:storage/development.sqlite3
    command: rails server -b 0.0.0.0

  frontend:
    image: node:20
    working_dir: /app
    volumes:
      - ./Frontend:/app
    ports:
      - "4200:4200"
    command: bash -c "npm install && ng serve --host 0.0.0.0"
```

#### 4.4 Gestione Errori Frontend

**Problema attuale:**
- Errori HTTP gestiti con `console.error()`
- Nessun feedback visivo all'utente in caso di errore rete

**Miglioramento suggerito:**
```typescript
// Interceptor per gestione errori centralizzata
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMsg = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMsg = error.error?.error || `Error: ${error.status} ${error.message}`;
      }

      // Mostrare snackbar/toast
      // inject(MatSnackBar).open(errorMsg, 'Close', { duration: 3000 });

      return throwError(() => new Error(errorMsg));
    })
  );
};
```

#### 4.5 Loading States

**Problema attuale:**
- Alcuni componenti non mostrano spinner durante chiamate HTTP
- UX non ottimale

**Miglioramento:**
- Usare signal `loading` in tutti i servizi
- Mostrare `<mat-spinner>` durante fetch
- Disabilitare pulsanti durante submit

**Esempio:**
```typescript
@if (loading()) {
  <mat-spinner></mat-spinner>
} @else {
  <!-- content -->
}
```

#### 4.6 Validazione Stock Real-time

**Problema attuale:**
- Stock validato solo al momento del checkout
- Possibile race condition se due utenti acquistano ultimo pezzo

**Miglioramento:**
```ruby
# app/models/cart_item.rb
def validate_stock_at_checkout
  if product.quantity < quantity
    errors.add(:quantity, "only #{product.quantity} available in stock")
  end
end

# app/controllers/api/orders_controller.rb
def create
  ActiveRecord::Base.transaction do
    # Lock products to prevent race conditions
    cart.cart_items.each do |item|
      product = Product.lock.find(item.product_id)
      if product.quantity < item.quantity
        raise "Insufficient stock for #{product.title}"
      end
      product.decrement!(:quantity, item.quantity)
    end

    # Create order...
  end
end
```

---

## 5. FUNZIONALITÀ AVANZATE

**Specifiche:** "ogni studente deve realizzare almeno 1 funzionalità avanzata"

**Già presente:** Area Admin (può contare come funzionalità primaria)

**Scelta per progetto:** Implementare **UNA** tra Wishlist o Internazionalizzazione

---

### 🌟 OPZIONE A: WISHLIST (Consigliata)

**Descrizione:** Lista di prodotti preferiti/salvati per ogni utente

**Complessità:** Media
**Tempo stimato:** 6-8 ore
**Impatto UX:** Alto

#### Backend Implementation

**1. Modello Wishlist**
```ruby
# rails generate model Wishlist user:references
# rails generate model WishlistItem wishlist:references product:references

# app/models/wishlist.rb
class Wishlist < ApplicationRecord
  belongs_to :user
  has_many :wishlist_items, dependent: :destroy
  has_many :products, through: :wishlist_items

  validates :user_id, presence: true, uniqueness: true
end

# app/models/wishlist_item.rb
class WishlistItem < ApplicationRecord
  belongs_to :wishlist
  belongs_to :product

  validates :product_id, uniqueness: { scope: :wishlist_id,
                                       message: "already in wishlist" }
end

# app/models/user.rb
class User < ApplicationRecord
  has_one :wishlist, dependent: :destroy

  after_create :create_wishlist

  private

  def create_wishlist
    Wishlist.create(user: self)
  end
end
```

**2. Controller Wishlist**
```ruby
# app/controllers/api/wishlists_controller.rb
module Api
  class WishlistsController < ApplicationController
    before_action :require_authentication!

    # GET /api/wishlist
    def show
      wishlist = current_user.wishlist.includes(:products)

      render json: {
        wishlist_items: wishlist.wishlist_items.map do |item|
          {
            id: item.id,
            product: item.product.as_json,
            added_at: item.created_at
          }
        end,
        count: wishlist.products.count
      }, status: :ok
    end

    # POST /api/wishlist/items
    def add_item
      wishlist = current_user.wishlist
      product = Product.find(params[:product_id])

      wishlist_item = wishlist.wishlist_items.create(product: product)

      if wishlist_item.persisted?
        render json: {
          message: 'Product added to wishlist',
          wishlist_item: wishlist_item.as_json
        }, status: :created
      else
        render json: {
          error: 'Failed to add product',
          details: wishlist_item.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Product not found' }, status: :not_found
    end

    # DELETE /api/wishlist/items/:id
    def remove_item
      wishlist_item = current_user.wishlist.wishlist_items.find(params[:id])
      wishlist_item.destroy

      render json: { message: 'Product removed from wishlist' }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Wishlist item not found' }, status: :not_found
    end

    # DELETE /api/wishlist
    def clear
      current_user.wishlist.wishlist_items.destroy_all
      render json: { message: 'Wishlist cleared' }, status: :ok
    end
  end
end
```

**3. Routes**
```ruby
# config/routes.rb
namespace :api do
  resource :wishlist, only: [:show, :destroy] do
    post 'items', to: 'wishlists#add_item'
    delete 'items/:id', to: 'wishlists#remove_item'
  end
end
```

#### Frontend Implementation

**1. Wishlist Service**
```typescript
// src/app/core/services/wishlist.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export interface WishlistResponse {
  wishlist_items: WishlistItem[];
  count: number;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  private wishlistSignal = signal<WishlistItem[]>([]);

  items = this.wishlistSignal.asReadonly();
  count = computed(() => this.wishlistSignal().length);
  isEmpty = computed(() => this.wishlistSignal().length === 0);

  loadWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(`${this.baseUrl}/wishlist`).pipe(
      tap(response => this.wishlistSignal.set(response.wishlist_items))
    );
  }

  addToWishlist(productId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/wishlist/items`,
      { product_id: productId }
    ).pipe(
      tap(() => this.loadWishlist().subscribe())
    );
  }

  removeFromWishlist(itemId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/wishlist/items/${itemId}`
    ).pipe(
      tap(() => this.loadWishlist().subscribe())
    );
  }

  clearWishlist(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/wishlist`).pipe(
      tap(() => this.wishlistSignal.set([]))
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistSignal().some(item => item.product.id === productId);
  }
}
```

**2. Wishlist Page Component**
```typescript
// src/app/features/wishlist/wishlist-page/wishlist-page.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-wishlist-page',
  template: `
    <div class="wishlist-container">
      <h1>My Wishlist</h1>

      @if (wishlistService.isEmpty()) {
        <div class="empty-state">
          <mat-icon>favorite_border</mat-icon>
          <p>Your wishlist is empty</p>
          <a mat-raised-button routerLink="/products">Browse Products</a>
        </div>
      } @else {
        <div class="wishlist-grid">
          @for (item of wishlistService.items(); track item.id) {
            <mat-card>
              <img [src]="item.product.thumbnail" [alt]="item.product.title">
              <mat-card-content>
                <h3>{{ item.product.title }}</h3>
                <p class="price">{{ item.product.price | currency }}</p>
                <p class="added-date">Added: {{ item.added_at | date:'short' }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary"
                        (click)="addToCart(item.product)">
                  Add to Cart
                </button>
                <button mat-icon-button color="warn"
                        (click)="removeFromWishlist(item.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>

        <button mat-raised-button color="warn" (click)="clearWishlist()">
          Clear Wishlist
        </button>
      }
    </div>
  `
})
export class WishlistPage implements OnInit {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);

  ngOnInit() {
    this.wishlistService.loadWishlist().subscribe();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => alert('Product added to cart!'),
      error: (err) => console.error(err)
    });
  }

  removeFromWishlist(itemId: number) {
    this.wishlistService.removeFromWishlist(itemId).subscribe();
  }

  clearWishlist() {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.wishlistService.clearWishlist().subscribe();
    }
  }
}
```

**3. Product Card - Wishlist Button**
```typescript
// Aggiungere a product-card o product-detail
<button mat-icon-button
        [color]="wishlistService.isInWishlist(product.id) ? 'warn' : 'default'"
        (click)="toggleWishlist()">
  <mat-icon>
    {{ wishlistService.isInWishlist(product.id) ? 'favorite' : 'favorite_border' }}
  </mat-icon>
</button>

// Component
toggleWishlist() {
  if (this.wishlistService.isInWishlist(this.product.id)) {
    // Remove (trovare item id)
    const item = this.wishlistService.items().find(i => i.product.id === this.product.id);
    if (item) {
      this.wishlistService.removeFromWishlist(item.id).subscribe();
    }
  } else {
    this.wishlistService.addToWishlist(this.product.id).subscribe();
  }
}
```

**4. Routes**
```typescript
// app.routes.ts
{
  path: 'wishlist',
  loadComponent: () => import('./features/wishlist/wishlist-page/wishlist-page').then(m => m.WishlistPage),
  canActivate: [checkoutGuardGuard] // Richiede login
}
```

**5. Header - Badge Wishlist**
```html
<!-- header.html -->
<a mat-button routerLink="/wishlist">
  <mat-icon [matBadge]="wishlistService.count()" matBadgeColor="warn">
    favorite
  </mat-icon>
  Wishlist
</a>
```

#### Testing Wishlist

**Backend Tests:**
```ruby
# spec/models/wishlist_spec.rb
RSpec.describe Wishlist, type: :model do
  it { should belong_to(:user) }
  it { should have_many(:wishlist_items) }
  it { should validate_uniqueness_of(:user_id) }
end

# spec/requests/wishlists_spec.rb
RSpec.describe 'Wishlists API', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'POST /api/wishlist/items' do
    it 'adds product to wishlist' do
      product = create(:product)

      post '/api/wishlist/items', params: { product_id: product.id }, headers: headers

      expect(response).to have_http_status(:created)
      expect(user.wishlist.products).to include(product)
    end

    it 'prevents duplicate products' do
      product = create(:product)
      user.wishlist.wishlist_items.create(product: product)

      post '/api/wishlist/items', params: { product_id: product.id }, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

---

### 🌍 OPZIONE B: INTERNAZIONALIZZAZIONE (i18n)

**Descrizione:** Supporto multilingua (Italiano + Inglese)

**Complessità:** Media
**Tempo stimato:** 8-10 ore
**Impatto UX:** Alto (accessibilità globale)

#### Backend Implementation

**1. Setup i18n Rails**
```ruby
# config/application.rb
config.i18n.available_locales = [:it, :en]
config.i18n.default_locale = :it

# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :set_locale

  private

  def set_locale
    I18n.locale = params[:locale] || request.headers['Accept-Language']&.scan(/^[a-z]{2}/)&.first || I18n.default_locale
  end
end
```

**2. Locale Files**
```yaml
# config/locales/it.yml
it:
  activerecord:
    errors:
      messages:
        blank: "non può essere vuoto"
        invalid: "non è valido"
        taken: "è già stato preso"
  errors:
    unauthorized: "Non autorizzato"
    not_found: "Non trovato"
    invalid_credentials: "Email o password non validi"
    cart_empty: "Il carrello è vuoto"
    insufficient_stock: "Scorte insufficienti per %{product}"
  models:
    product:
      created: "Prodotto creato con successo"
      updated: "Prodotto aggiornato con successo"
      deleted: "Prodotto eliminato con successo"
    order:
      created: "Ordine creato con successo"
      not_found: "Ordine non trovato"
    cart:
      item_added: "Prodotto aggiunto al carrello"
      item_removed: "Prodotto rimosso dal carrello"
      cleared: "Carrello svuotato"

# config/locales/en.yml
en:
  activerecord:
    errors:
      messages:
        blank: "can't be blank"
        invalid: "is invalid"
        taken: "has already been taken"
  errors:
    unauthorized: "Unauthorized"
    not_found: "Not found"
    invalid_credentials: "Invalid email or password"
    cart_empty: "Cart is empty"
    insufficient_stock: "Insufficient stock for %{product}"
  models:
    product:
      created: "Product created successfully"
      updated: "Product updated successfully"
      deleted: "Product deleted successfully"
    order:
      created: "Order created successfully"
      not_found: "Order not found"
    cart:
      item_added: "Product added to cart"
      item_removed: "Product removed from cart"
      cleared: "Cart cleared"
```

**3. Update Controllers**
```ruby
# app/controllers/api/orders_controller.rb
def create
  # ...
  render json: {
    message: I18n.t('models.order.created'),
    order: order.as_json
  }, status: :created
rescue StandardError => e
  render json: { error: I18n.t('errors.cart_empty') }, status: :unprocessable_entity
end

# app/controllers/api/authentication_controller.rb
def login
  # ...
  if user&.authenticate(params[:password])
    # ...
  else
    render json: { error: I18n.t('errors.invalid_credentials') }, status: :unauthorized
  end
end
```

#### Frontend Implementation

**1. Setup Angular i18n**
```bash
# Installare @angular/localize
npm install --save @angular/localize

# Estrarre messaggi traducibili
ng extract-i18n --output-path src/locale
```

**2. Locale Files**
```xml
<!-- src/locale/messages.it.xlf -->
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" target-language="it" datatype="plaintext">
    <body>
      <trans-unit id="product.addToCart" datatype="html">
        <source>Add to Cart</source>
        <target>Aggiungi al Carrello</target>
      </trans-unit>
      <trans-unit id="cart.empty" datatype="html">
        <source>Your cart is empty</source>
        <target>Il tuo carrello è vuoto</target>
      </trans-unit>
      <trans-unit id="checkout.title" datatype="html">
        <source>Checkout</source>
        <target>Pagamento</target>
      </trans-unit>
      <!-- ... -->
    </body>
  </file>
</xliff>
```

**3. Update Templates con i18n**
```html
<!-- product-card.html -->
<button mat-raised-button i18n="@@product.addToCart">Add to Cart</button>

<!-- cart-page.html -->
<h1 i18n="@@cart.title">Shopping Cart</h1>
<p i18n="@@cart.empty">Your cart is empty</p>
<span i18n="@@cart.total">Total</span>

<!-- checkout-page.html -->
<h1 i18n="@@checkout.title">Checkout</h1>
<label i18n="@@checkout.firstName">First Name</label>
<label i18n="@@checkout.lastName">Last Name</label>
<label i18n="@@checkout.email">Email</label>
<label i18n="@@checkout.address">Address</label>
<button i18n="@@checkout.submit">Place Order</button>
```

**4. Language Switcher Service**
```typescript
// src/app/core/services/language.service.ts
import { Injectable, signal } from '@angular/core';

export type Language = 'it' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private currentLangSignal = signal<Language>('it');

  currentLang = this.currentLangSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('language') as Language;
    if (saved) {
      this.currentLangSignal.set(saved);
    }
  }

  setLanguage(lang: Language) {
    this.currentLangSignal.set(lang);
    localStorage.setItem('language', lang);

    // Reload app con nuova lingua (Angular i18n richiede build separati)
    window.location.reload();
  }

  getLanguage(): Language {
    return this.currentLangSignal();
  }
}
```

**5. Language Switcher Component**
```typescript
// src/app/shared/language-switcher/language-switcher.ts
import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <mat-button-toggle-group [value]="languageService.currentLang()"
                             (change)="onLanguageChange($event)">
      <mat-button-toggle value="it">🇮🇹 IT</mat-button-toggle>
      <mat-button-toggle value="en">🇬🇧 EN</mat-button-toggle>
    </mat-button-toggle-group>
  `
})
export class LanguageSwitcher {
  languageService = inject(LanguageService);

  onLanguageChange(event: any) {
    this.languageService.setLanguage(event.value);
  }
}
```

**6. HTTP Interceptor per Locale**
```typescript
// src/app/core/interceptors/locale.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

export const localeInterceptor: HttpInterceptorFn = (req, next) => {
  const languageService = inject(LanguageService);
  const locale = languageService.getLanguage();

  const clonedReq = req.clone({
    setHeaders: {
      'Accept-Language': locale
    },
    setParams: {
      locale: locale
    }
  });

  return next(clonedReq);
};
```

**7. Build Configuration**
```json
// angular.json
{
  "projects": {
    "frontend": {
      "i18n": {
        "sourceLocale": "en",
        "locales": {
          "it": {
            "translation": "src/locale/messages.it.xlf",
            "baseHref": "/it/"
          }
        }
      },
      "architect": {
        "build": {
          "configurations": {
            "it": {
              "localize": ["it"]
            }
          }
        },
        "serve": {
          "configurations": {
            "it": {
              "buildTarget": "frontend:build:development,it"
            }
          }
        }
      }
    }
  }
}
```

**8. Scripts Build**
```json
// package.json
{
  "scripts": {
    "start": "ng serve",
    "start:it": "ng serve --configuration=it",
    "build:i18n": "ng build --localize"
  }
}
```

#### Testing i18n

**Backend:**
```ruby
# spec/requests/localization_spec.rb
RSpec.describe 'Localization', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'Italian locale' do
    it 'returns error messages in Italian' do
      post '/api/login', params: { email: 'wrong', password: 'wrong' },
           headers: { 'Accept-Language' => 'it' }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)['error']).to eq('Email o password non validi')
    end
  end

  describe 'English locale' do
    it 'returns error messages in English' do
      post '/api/login', params: { email: 'wrong', password: 'wrong' },
           headers: { 'Accept-Language' => 'en' }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)['error']).to eq('Invalid email or password')
    end
  end
end
```

**Frontend:**
- Test manuale cambiando lingua e verificando testi
- Build con `ng build --localize` per verificare build separate

---

### 📊 CONFRONTO OPZIONI

| Criterio | Wishlist | i18n |
|----------|----------|------|
| **Complessità backend** | Media (2 modelli, 1 controller) | Bassa (solo locale files) |
| **Complessità frontend** | Media (1 service, 1 page, UI updates) | Alta (build config, translations) |
| **Tempo implementazione** | 6-8 ore | 8-10 ore |
| **Valore per CV** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Difficoltà test** | Media | Bassa |
| **UX Impact** | Alto (feature utile) | Alto (accessibilità) |
| **Manutenibilità** | Alta | Media (doppia manutenzione testi) |

**RACCOMANDAZIONE:**
- **Wishlist** se vuoi focus su backend/database/API design
- **i18n** se vuoi focus su frontend/configurazione/accessibilità

---

## 6. TESTING

### 🧪 Piano Testing Completo

#### 6.1 Backend Tests (Minimo Richiesto)

**RSpec Configurazione:** ✅ Già presente

**Test da implementare:**

##### Test Modelli (Minimo: 1 richiesto)
```ruby
# spec/models/product_spec.rb
require 'rails_helper'

RSpec.describe Product, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      product = Product.new(
        id: 'test-1',
        title: 'Test Product',
        price: 9.99,
        original_price: 19.99,
        quantity: 10
      )
      expect(product).to be_valid
    end

    it 'is not valid without a title' do
      product = Product.new(title: nil)
      expect(product).not_to be_valid
      expect(product.errors[:title]).to include("can't be blank")
    end

    it 'is not valid with negative price' do
      product = Product.new(title: 'Test', price: -5)
      expect(product).not_to be_valid
    end

    it 'is not valid with negative quantity' do
      product = Product.new(title: 'Test', price: 10, original_price: 15, quantity: -1)
      expect(product).not_to be_valid
    end
  end

  describe '#in_stock?' do
    it 'returns true when quantity > 0' do
      product = Product.new(quantity: 5)
      expect(product.in_stock?).to be true
    end

    it 'returns false when quantity = 0' do
      product = Product.new(quantity: 0)
      expect(product.in_stock?).to be false
    end
  end
end

# spec/models/order_spec.rb
require 'rails_helper'

RSpec.describe Order, type: :model do
  describe 'validations' do
    it 'validates total is positive' do
      order = Order.new(total: -10)
      expect(order).not_to be_valid
    end

    it 'validates customer presence' do
      order = Order.new(customer: nil)
      expect(order).not_to be_valid
    end

    it 'validates address presence' do
      order = Order.new(address: nil)
      expect(order).not_to be_valid
    end
  end

  describe 'associations' do
    it 'has many order_items' do
      association = described_class.reflect_on_association(:order_items)
      expect(association.macro).to eq :has_many
    end

    it 'belongs to user (optional)' do
      association = described_class.reflect_on_association(:user)
      expect(association.macro).to eq :belongs_to
    end
  end
end
```

##### Test Request/Controller (Minimo: 1 richiesto)
```ruby
# spec/requests/orders_spec.rb
require 'rails_helper'

RSpec.describe 'Orders API', type: :request do
  let(:user) { create(:user) }
  let(:product) { create(:product, quantity: 10) }
  let(:headers) { { 'Authorization' => "Bearer #{generate_token(user)}" } }

  before do
    # Setup cart con prodotto
    cart = user.cart
    cart.cart_items.create(product: product, quantity: 2, unit_price: product.price)
  end

  describe 'POST /api/orders' do
    let(:valid_params) do
      {
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        address: {
          street: '123 Main St',
          city: 'Rome',
          zip: '00100'
        }
      }
    end

    context 'when authenticated' do
      it 'creates a new order' do
        expect {
          post '/api/orders', params: valid_params, headers: headers
        }.to change(Order, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it 'creates order items from cart' do
        post '/api/orders', params: valid_params, headers: headers

        order = Order.last
        expect(order.order_items.count).to eq(1)
        expect(order.order_items.first.product).to eq(product)
      end

      it 'clears cart after order creation' do
        post '/api/orders', params: valid_params, headers: headers

        user.cart.reload
        expect(user.cart.cart_items.count).to eq(0)
      end

      it 'calculates correct total' do
        post '/api/orders', params: valid_params, headers: headers

        order = Order.last
        expect(order.total).to eq(product.price * 2)
      end

      it 'returns error when cart is empty' do
        user.cart.cart_items.destroy_all

        post '/api/orders', params: valid_params, headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to be_present
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post '/api/orders', params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/orders' do
    before do
      create(:order, user: user)
      create(:order, user: user)
      create(:order) # Altro utente
    end

    it 'returns only user orders' do
      get '/api/orders', headers: headers

      expect(response).to have_http_status(:ok)
      orders = JSON.parse(response.body)
      expect(orders.length).to eq(2)
    end
  end
end

# spec/requests/cart_items_spec.rb
require 'rails_helper'

RSpec.describe 'Cart Items API', type: :request do
  let(:user) { create(:user) }
  let(:product) { create(:product, quantity: 10) }
  let(:headers) { { 'Authorization' => "Bearer #{generate_token(user)}" } }

  describe 'POST /api/cart/items' do
    it 'adds product to cart' do
      post '/api/cart/items',
           params: { product_id: product.id, quantity: 2 },
           headers: headers

      expect(response).to have_http_status(:created)
      expect(user.cart.cart_items.count).to eq(1)
    end

    it 'validates product stock availability' do
      post '/api/cart/items',
           params: { product_id: product.id, quantity: 100 },
           headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

##### Factories (usando FactoryBot)
```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'password123' }
    first_name { 'John' }
    last_name { 'Doe' }
    role { 'user' }

    trait :admin do
      role { 'admin' }
    end
  end
end

# spec/factories/products.rb
FactoryBot.define do
  factory :product do
    sequence(:id) { |n| "product-#{n}" }
    sequence(:title) { |n| "Product #{n}" }
    description { 'Test product description' }
    price { 9.99 }
    original_price { 19.99 }
    quantity { 10 }
    sale { false }
  end
end

# spec/factories/orders.rb
FactoryBot.define do
  factory :order do
    association :user
    total { 99.99 }
    customer do
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    end
    address do
      {
        street: '123 Main St',
        city: 'Rome',
        zip: '00100'
      }
    end
  end
end
```

##### Helper Methods
```ruby
# spec/support/auth_helpers.rb
module AuthHelpers
  def generate_token(user)
    payload = {
      user_id: user.id,
      role: user.role,
      exp: 24.hours.from_now.to_i
    }
    JWT.encode(payload, Rails.application.secret_key_base)
  end

  def auth_headers(user)
    { 'Authorization' => "Bearer #{generate_token(user)}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
```

#### 6.2 Frontend Tests (Opzionale ma Consigliato)

##### Jasmine/Karma già configurato in Angular

**Test Service (Minimo: 2 se scelto come funzionalità avanzata)**
```typescript
// src/app/core/services/cart.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load cart on initialization', () => {
    const mockCart = {
      items: [
        { id: 1, product: { id: '1', title: 'Product 1', price: 10 }, quantity: 2 }
      ],
      total: 20,
      item_count: 2
    };

    service.loadCart().subscribe(cart => {
      expect(cart.items.length).toBe(1);
      expect(cart.total).toBe(20);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('GET');
    req.flush(mockCart);
  });

  it('should add item to cart', () => {
    const productId = '1';
    const quantity = 2;

    service.addToCart(productId, quantity).subscribe(response => {
      expect(response.message).toBe('Product added to cart');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/cart/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product_id: productId, quantity });
    req.flush({ message: 'Product added to cart' });
  });

  it('should calculate total correctly', () => {
    // Assumendo cart già caricato con signal
    service['cartSignal'].set({
      items: [
        { id: 1, product: { id: '1', title: 'P1', price: 10 }, quantity: 2, unit_price: 10 },
        { id: 2, product: { id: '2', title: 'P2', price: 5 }, quantity: 3, unit_price: 5 }
      ],
      total: 35,
      item_count: 5
    });

    expect(service.total()).toBe(35);
    expect(service.itemCount()).toBe(5);
  });
});

// src/app/core/services/auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  it('should login and store token', () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { id: 1, email: 'test@example.com', role: 'user' }
    };

    service.login('test@example.com', 'password').subscribe(response => {
      expect(response.token).toBe('fake-jwt-token');
      expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should check if user is admin', () => {
    localStorage.setItem('current_user', JSON.stringify({ role: 'admin' }));
    service['currentUserSignal'].set({ id: 1, email: 'admin@example.com', role: 'admin' });

    expect(service.isAdmin()).toBe(true);
  });
});
```

**Test Component (Minimo: 2 se scelto come funzionalità avanzata)**
```typescript
// src/app/features/products/product-page/product-page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductPage } from './product-page';
import { ProductApi } from '../../../core/services/product-api';
import { of } from 'rxjs';

describe('ProductPage', () => {
  let component: ProductPage;
  let fixture: ComponentFixture<ProductPage>;
  let productApiSpy: jasmine.SpyObj<ProductApi>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductApi', ['list']);

    await TestBed.configureTestingModule({
      imports: [ProductPage],
      providers: [
        { provide: ProductApi, useValue: spy }
      ]
    }).compileComponents();

    productApiSpy = TestBed.inject(ProductApi) as jasmine.SpyObj<ProductApi>;
    fixture = TestBed.createComponent(ProductPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    const mockProducts = [
      { id: '1', title: 'Product 1', price: 10, quantity: 5 },
      { id: '2', title: 'Product 2', price: 20, quantity: 10 }
    ];

    productApiSpy.list.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(productApiSpy.list).toHaveBeenCalled();
    expect(component.filteredProducts().length).toBe(2);
  });

  it('should filter products by search term', () => {
    component['productsSignal'].set([
      { id: '1', title: 'iPhone 14', price: 999, quantity: 5 },
      { id: '2', title: 'Samsung Galaxy', price: 799, quantity: 10 },
      { id: '3', title: 'iPhone 13', price: 799, quantity: 3 }
    ]);

    component.searchControl.setValue('iPhone');

    // Aspettare debounce (200ms)
    setTimeout(() => {
      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(2);
      expect(filtered.every(p => p.title.includes('iPhone'))).toBe(true);
    }, 250);
  });
});

// src/app/features/checkout/checkout-page/checkout-page.spec.ts
describe('CheckoutPage', () => {
  let component: CheckoutPage;
  let fixture: ComponentFixture<CheckoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPage, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should validate required fields', () => {
    const form = component.checkoutForm;

    expect(form.valid).toBeFalsy();

    form.patchValue({
      customer: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      address: { street: '123 Main', city: 'Rome', zip: '00100' },
      privacy: true
    });

    expect(form.valid).toBeTruthy();
  });

  it('should validate ZIP code format', () => {
    const zipControl = component.checkoutForm.get('address.zip');

    zipControl?.setValue('123'); // Troppo corto
    expect(zipControl?.hasError('pattern')).toBe(true);

    zipControl?.setValue('12345'); // OK
    expect(zipControl?.valid).toBe(true);
  });
});
```

#### 6.3 Test E2E (Opzionale - Funzionalità Avanzata Bonus)

**Se scelta come SECONDA funzionalità avanzata:**

```typescript
// e2e/src/checkout.e2e-spec.ts
import { browser, by, element } from 'protractor';

describe('E2E: Checkout Flow', () => {
  beforeEach(async () => {
    await browser.get('/login');
  });

  it('should complete full checkout flow', async () => {
    // 1. Login
    await element(by.css('input[formControlName="email"]')).sendKeys('user@example.com');
    await element(by.css('input[formControlName="password"]')).sendKeys('password123');
    await element(by.css('button[type="submit"]')).click();

    // 2. Navigate to products
    await browser.wait(() => browser.getCurrentUrl().then(url => url.includes('/products')), 5000);

    // 3. Add product to cart
    await element.all(by.css('.add-to-cart-btn')).first().click();
    await browser.sleep(1000);

    // 4. Go to cart
    await element(by.linkText('Cart')).click();
    await browser.wait(() => browser.getCurrentUrl().then(url => url.includes('/cart')), 5000);

    // 5. Proceed to checkout
    await element(by.css('.checkout-btn')).click();
    await browser.wait(() => browser.getCurrentUrl().then(url => url.includes('/checkout')), 5000);

    // 6. Fill checkout form
    await element(by.css('input[formControlName="firstName"]')).sendKeys('John');
    await element(by.css('input[formControlName="lastName"]')).sendKeys('Doe');
    await element(by.css('input[formControlName="email"]')).sendKeys('john@example.com');
    await element(by.css('input[formControlName="street"]')).sendKeys('123 Main St');
    await element(by.css('input[formControlName="city"]')).sendKeys('Rome');
    await element(by.css('input[formControlName="zip"]')).sendKeys('00100');
    await element(by.css('input[formControlName="privacy"]')).click();

    // 7. Submit order
    await element(by.css('button[type="submit"]')).click();
    await browser.sleep(2000);

    // 8. Verify success
    const successMsg = await element(by.css('.success-message')).getText();
    expect(successMsg).toContain('Order placed successfully');
  });
});
```

---

## 7. DOCUMENTAZIONE

### 📝 Documenti da Creare/Aggiornare

#### 7.1 README.md Completo

**Struttura richiesta dalle specifiche:**

```markdown
# E-Commerce Full-Stack - Progetto Sistemi Web 2025/2026

Applicazione e-commerce completa sviluppata con Angular (frontend) e Ruby on Rails (backend API).

## Studente
- **Nome:** [Nome Cognome]
- **Matricola:** [Numero]
- **Email:** [email@studenti.unipd.it]

## Tecnologie Utilizzate

### Backend
- Ruby 3.4.7
- Rails 8.1.1 (API mode)
- SQLite3 (development), PostgreSQL (production recommended)
- JWT per autenticazione
- RSpec per testing

### Frontend
- Angular 21
- TypeScript 5.7
- Angular Material 21
- RxJS con Signals

## Prerequisiti Software

Prima di iniziare, assicurati di avere installato:

- **Ruby:** versione 3.4.7 (consigliato gestione con rbenv/rvm)
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
git clone [URL_REPOSITORY]
cd Progetto_Sistemi_Web
```

### 2. Setup Backend

```bash
cd Backend

# Installa dipendenze
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed

# Avvia server (porta 3000)
rails server
```

Il backend sarà disponibile su: http://localhost:3000

**Seed Data:**
Il comando `rails db:seed` crea:
- 1 Admin: `admin@example.com` / `password123`
- 2 Utenti: `user@example.com` / `password123`, `user2@example.com` / `password123`
- Circa 30 prodotti di esempio importati da `Frontend/shop-mock-api/db.json`

### 3. Setup Frontend

```bash
cd ../Frontend

# Installa dipendenze
npm install

# Avvia development server (porta 4200)
ng serve
```

Il frontend sarà disponibile su: http://localhost:4200

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

### API Endpoints

#### Pubblici
- `GET /api/products` - Lista prodotti (filtri opzionali: tag, q, page, per_page)
- `GET /api/products/:id` - Dettaglio prodotto
- `POST /api/register` - Registrazione utente
- `POST /api/login` - Login (restituisce JWT token)

#### Autenticati (richiede header Authorization: Bearer <token>)
- `GET /api/me` - Profilo utente corrente
- `GET /api/cart` - Visualizza carrello
- `POST /api/cart/items` - Aggiungi prodotto al carrello
- `PATCH /api/cart/items/:id` - Aggiorna quantità
- `DELETE /api/cart/items/:id` - Rimuovi articolo
- `DELETE /api/cart` - Svuota carrello
- `GET /api/orders` - Lista ordini (utente vede solo i propri, admin vede tutti)
- `POST /api/orders` - Crea ordine da carrello

#### Admin (richiede ruolo admin)
- `POST /api/admin/products` - Crea prodotto
- `PUT/PATCH /api/admin/products/:id` - Aggiorna prodotto
- `DELETE /api/admin/products/:id` - Elimina prodotto
- `PATCH /api/admin/products/:id/adjust_quantity` - Aggiusta inventario
- `GET /api/admin/orders` - Lista tutti ordini con statistiche
- `GET /api/admin/orders/:id` - Dettaglio ordine
- `DELETE /api/admin/orders/:id` - Elimina ordine
- `GET /api/admin/stats` - Statistiche dashboard

### Flusso Autenticazione

1. **Registrazione/Login:**
   - Frontend invia credenziali a `POST /api/login`
   - Backend valida credenziali e genera JWT token
   - Token contiene: `{ user_id, role, exp: 24h }`
   - Frontend salva token in localStorage

2. **Richieste Autenticate:**
   - HttpInterceptor aggiunge automaticamente header: `Authorization: Bearer <token>`
   - Backend verifica token tramite `ApplicationController#authenticate_request`
   - Se valido, imposta `@current_user`

3. **Protezione Route:**
   - Backend: `before_action :require_authentication!` e `require_admin!`
   - Frontend: Guards `checkoutGuardGuard`, `adminGuard`

### Flusso Carrello → Checkout → Ordine

1. **Aggiunta Carrello:**
   - Utente clicca "Add to Cart"
   - Frontend: `CartService.addToCart(productId, quantity)`
   - Backend: Crea/Aggiorna CartItem associato a Cart utente
   - Validazione: stock disponibile

2. **Visualizzazione Carrello:**
   - Frontend carica carrello da `GET /api/cart`
   - Calcolo totale server-side
   - Modifica quantità: `PATCH /api/cart/items/:id`

3. **Checkout:**
   - Protezione: richiede login (guard)
   - Form validato: customer info, address, privacy
   - Submit: `POST /api/orders` con dati form

4. **Creazione Ordine:**
   - Backend:
     - Validazione: carrello non vuoto, stock disponibile
     - Transaction: crea Order, copia CartItems → OrderItems
     - Decrementa quantità prodotti
     - Svuota carrello
   - Frontend: redirect a conferma, ricarica carrello

## Funzionalità Avanzate Implementate

### 1. Area Amministratore ✅

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

### 2. [WISHLIST / INTERNAZIONALIZZAZIONE] ✅

[Inserire qui descrizione dettagliata della funzionalità scelta]

#### Wishlist (se scelta)
- Possibilità per utenti registrati di salvare prodotti preferiti
- Persistenza backend (modelli Wishlist, WishlistItem)
- UI: icona cuore su product card, pagina dedicata `/wishlist`
- Funzioni: aggiungi, rimuovi, visualizza, svuota wishlist
- Badge counter su header

#### Internazionalizzazione (se scelta)
- Supporto 2 lingue: Italiano (default) + Inglese
- Backend: Rails i18n con locale files (it.yml, en.yml)
- Frontend: Angular i18n con build separati
- Language switcher in header
- Messaggi errore, label form, UI tradotti
- Header `Accept-Language` inviato automaticamente

## Testing

### Backend Tests (RSpec)

```bash
cd Backend
bundle exec rspec
```

**Test implementati:**
- `spec/models/product_spec.rb` - Validazioni Product
- `spec/models/order_spec.rb` - Validazioni Order
- `spec/requests/orders_spec.rb` - Endpoint POST /api/orders
- `spec/requests/cart_items_spec.rb` - Endpoint POST /api/cart/items
- [Altri test implementati...]

**Coverage:** [X test, Y assertions]

### Frontend Tests (Jasmine/Karma)

```bash
cd Frontend
ng test
```

**Test implementati:**
- `cart.service.spec.ts` - Unit test CartService
- `auth.service.spec.ts` - Unit test AuthService
- `product-page.spec.ts` - Component ProductPage
- `checkout-page.spec.ts` - Component CheckoutPage
- [Altri test implementati...]

### E2E Tests (opzionale)

```bash
ng e2e
```

Scenari testati:
- Login → Add to Cart → Checkout → Order

## Deployment Production (Note)

**Database:**
- Per produzione si consiglia PostgreSQL invece di SQLite
- Configurazione in `config/database.yml` (production)
- Variabili ambiente: `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`

**Secrets:**
- Rails: impostare `RAILS_MASTER_KEY` o `config/master.key`
- JWT: cambiare `Rails.application.secret_key_base`

**CORS:**
- Aggiornare `config/initializers/cors.rb` con dominio produzione

**Frontend Build:**
```bash
ng build --configuration production
# Output in dist/frontend
```

## Docker (Opzionale)

```bash
# Avvia tutto con Docker Compose
docker-compose up

# Backend: http://localhost:3000
# Frontend: http://localhost:4200
```

## Scelte Architetturali e Tecnologiche

### Perché JWT invece di Devise?
- Approccio stateless adatto a API REST
- Nessuna session server-side
- Facilita scalabilità orizzontale
- Frontend completamente disaccoppiato

### Perché SQLite?
- Rapidità setup development
- Zero configurazione
- Adatto a progetti didattici
- **Limitazione:** non adatto a produzione (documentato)

### Perché Angular Signals?
- Nuovo sistema reattivo di Angular (v16+)
- Performance migliori rispetto a Zone.js
- Codice più leggibile e manutenibile
- Change detection ottimizzata

### Gestione Stato Frontend
- **Carrello:** Backend-based (NO localStorage per items, solo token)
- **Autenticazione:** localStorage per token + Signal per stato reattivo
- **Prodotti:** Fetch on-demand, no caching complesso

## Problemi Noti e Limitazioni

1. **SQLite Concurrency:** Non gestisce bene scritture concorrenti multiple
2. **Paginazione:** Attualmente solo frontend (tutti prodotti caricati)
3. **Stati Ordini:** Non implementato (pending/shipped/delivered)
4. **Email Notifications:** Non presente
5. **Password Reset:** Non implementato
6. **Upload Immagini:** Solo URL esterni (nessun file upload)
7. **Caching:** Nessuna strategia di caching implementata
8. **Rate Limiting:** Non presente (vulnerabile a abuse)

## Possibili Miglioramenti Futuri

- [ ] Migrazione a PostgreSQL
- [ ] Paginazione backend-based
- [ ] Stati ordini con state machine
- [ ] Email notifications (OrderMailer)
- [ ] Upload immagini prodotti (Active Storage)
- [ ] Ricerca full-text (ElasticSearch/pg_search)
- [ ] Caching con Redis
- [ ] Rate limiting (Rack::Attack)
- [ ] Admin dashboard con charts (Chart.js)
- [ ] Export ordini CSV/PDF
- [ ] Review e rating prodotti

## Licenza

Progetto didattico - Università di Padova - AA 2025/2026

## Contatti

- Email: [email@studenti.unipd.it]
- GitHub: [username]
```

#### 7.2 ARCHITETTURA.md

**Contenuto suggerito:**

```markdown
# Architettura Progetto E-Commerce

## Overview

Applicazione full-stack separata in due progetti indipendenti:
- **Backend:** Rails 8 API-only mode
- **Frontend:** Angular 21 SPA

Comunicazione tramite API REST JSON con autenticazione JWT.

## Diagramma Architettura

```
┌─────────────────────┐
│   Angular Frontend  │
│   (localhost:4200)  │
│                     │
│  - Components       │
│  - Services         │
│  - Guards           │
│  - Interceptors     │
└──────────┬──────────┘
           │
           │ HTTP/JSON
           │ JWT Token
           ▼
┌─────────────────────┐
│   Rails Backend     │
│   (localhost:3000)  │
│                     │
│  - API Controllers  │
│  - Models           │
│  - Validations      │
│  - JWT Auth         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   SQLite Database   │
│                     │
│  - users            │
│  - products         │
│  - carts            │
│  - cart_items       │
│  - orders           │
│  - order_items      │
└─────────────────────┘
```

## Modelli del Dominio

### Product
Rappresenta un prodotto nel catalogo.

**Attributi:**
- `id` (string): Identificativo univoco
- `title` (string): Nome prodotto
- `description` (text): Descrizione
- `price` (decimal): Prezzo corrente
- `original_price` (decimal): Prezzo originale (per sconti)
- `sale` (boolean): Flag sconto attivo
- `thumbnail` (string): URL immagine
- `tags` (json): Array categorie/tag
- `quantity` (integer): Quantità disponibile in magazzino

**Relazioni:**
- `has_many :cart_items`
- `has_many :order_items`

**Validazioni:**
- title obbligatorio
- price > 0
- original_price > 0
- quantity >= 0

**Business Logic:**
- `in_stock?`: verifica disponibilità
- `out_of_stock?`: prodotto esaurito

### User
Rappresenta un utente (normale o admin).

**Attributi:**
- `email` (string, unique): Email login
- `password_digest` (string): Password hash BCrypt
- `first_name`, `last_name` (string): Dati anagrafici
- `address` (string): Indirizzo
- `role` (string): 'user' | 'admin'

**Relazioni:**
- `has_one :cart`
- `has_many :orders`

**Autenticazione:**
- `has_secure_password` (BCrypt)

**Validazioni:**
- email obbligatoria, univoca, formato valido
- password min 6 caratteri
- role in enum ['user', 'admin']

### Cart
Carrello acquisti associato a utente.

**Attributi:**
- `user_id` (foreign key): Proprietario
- `expires_at` (datetime): Scadenza carrello

**Relazioni:**
- `belongs_to :user`
- `has_many :cart_items`
- `has_many :products, through: :cart_items`

**Metodi:**
- `total`: somma prezzi cart_items
- `item_count`: conteggio articoli
- `empty?`: carrello vuoto
- `clear_items`: svuota carrello

**Validazioni:**
- user_id obbligatorio e univoco (1 cart per utente)

### CartItem
Singola riga carrello (prodotto + quantità).

**Attributi:**
- `cart_id` (foreign key)
- `product_id` (foreign key)
- `quantity` (integer): Quantità richiesta
- `unit_price` (decimal): Prezzo unitario al momento aggiunta

**Relazioni:**
- `belongs_to :cart`
- `belongs_to :product`

**Validazioni:**
- quantity > 0
- unit_price > 0
- product_id univoco per cart (no duplicati)
- Validazione custom: `product_in_stock`, `quantity_available`

**Indice Univoco:**
- `UNIQUE INDEX (cart_id, product_id)`

### Order
Ordine completato da utente.

**Attributi:**
- `user_id` (foreign key, nullable): Utente registrato (se loggato)
- `customer` (json): Dati cliente `{firstName, lastName, email}`
- `address` (json): Indirizzo spedizione `{street, city, zip}`
- `total` (decimal): Totale ordine
- `created_at` (timestamp): Data ordine

**Relazioni:**
- `belongs_to :user, optional: true`
- `has_many :order_items`
- `has_many :products, through: :order_items`

**Validazioni:**
- total > 0
- customer obbligatorio
- address obbligatorio

**Note:**
- Supporta ordini guest (user_id NULL)
- Customer/address duplicati da form per storicizzazione

### OrderItem
Singola riga ordine (snapshot prodotto al momento ordine).

**Attributi:**
- `order_id` (foreign key)
- `product_id` (foreign key)
- `quantity` (integer): Quantità ordinata
- `unit_price` (decimal): Prezzo al momento ordine (frozen)

**Relazioni:**
- `belongs_to :order`
- `belongs_to :product`

**Validazioni:**
- quantity > 0 intero
- unit_price > 0

**Note:**
- `unit_price` storicizza prezzo al momento ordine (non cambia se product.price cambia)

## Flusso Login → Carrello → Checkout → Ordine

### 1. Registrazione/Login

```
User                Frontend              Backend              Database
  │                    │                     │                     │
  ├─ Compila Form ────▶│                     │                     │
  │                    │                     │                     │
  │                    ├─ POST /api/register ▶                     │
  │                    │   {email, password, │                     │
  │                    │    first_name, ...} │                     │
  │                    │                     │                     │
  │                    │                     ├─ BCrypt.hash() ────▶│
  │                    │                     │                     │
  │                    │                     ├─ User.create() ────▶│
  │                    │                     │                     │
  │                    │                     ├─ Cart.create() ────▶│
  │                    │                     │                     │
  │                    │                     ├─ JWT.encode() ─────▶│
  │                    │                     │                     │
  │                    │◀── {token, user} ───┤                     │
  │                    │                     │                     │
  │                    ├─ localStorage.set() │                     │
  │                    │   ('auth_token')    │                     │
  │                    │                     │                     │
  │◀── Redirect /products                    │                     │
```

**POST /api/login:**
1. Backend verifica `user.authenticate(password)` con BCrypt
2. Se OK: genera JWT con payload `{user_id, role, exp: 24h}`
3. Frontend salva token in localStorage
4. Tutte le richieste successive includono header: `Authorization: Bearer <token>`

### 2. Aggiunta Prodotto al Carrello

```
User                Frontend              Backend              Database
  │                    │                     │                     │
  ├─ Click "Add Cart"─▶│                     │                     │
  │                    │                     │                     │
  │                    ├─ POST /cart/items ─▶│                     │
  │                    │   {product_id: 'X', │                     │
  │                    │    quantity: 2}     │                     │
  │                    │   Header: Bearer... │                     │
  │                    │                     │                     │
  │                    │                     ├─ Verify JWT ───────▶│
  │                    │                     │                     │
  │                    │                     ├─ Find user.cart ───▶│
  │                    │                     │                     │
  │                    │                     ├─ Find product ─────▶│
  │                    │                     │                     │
  │                    │                     ├─ Validate stock ───▶│
  │                    │                     │   (quantity >= 2?)  │
  │                    │                     │                     │
  │                    │                     ├─ CartItem.create() ▶│
  │                    │                     │   or update qty     │
  │                    │                     │                     │
  │                    │◀── {cart_item} ─────┤                     │
  │                    │                     │                     │
  │                    ├─ cartSignal.update()│                     │
  │                    │                     │                     │
  │◀── Feedback "Added!"                     │                     │
```

**Validazioni:**
1. `CartItem` valida che `product.quantity >= requested_quantity`
2. Se già presente, aggiorna quantità invece di duplicare
3. UNIQUE INDEX su (cart_id, product_id) previene race condition

### 3. Visualizzazione Carrello

```
User                Frontend              Backend              Database
  │                    │                     │                     │
  ├─ Navigate /cart ──▶│                     │                     │
  │                    │                     │                     │
  │                    ├─ GET /api/cart ────▶│                     │
  │                    │   Header: Bearer... │                     │
  │                    │                     │                     │
  │                    │                     ├─ Find user.cart ───▶│
  │                    │                     │   .includes(        │
  │                    │                     │     cart_items:     │
  │                    │                     │       :product)     │
  │                    │                     │                     │
  │                    │◀── {items: [...],───┤                     │
  │                    │     total: 99.99,   │                     │
  │                    │     item_count: 3}  │                     │
  │                    │                     │                     │
  │                    ├─ Render cart items  │                     │
  │                    │                     │                     │
  │◀── Display cart                          │                     │
```

**Calcolo Totale:**
```ruby
cart.cart_items.sum { |item| item.unit_price * item.quantity }
```

### 4. Modifica Quantità

```
User                Frontend              Backend
  │                    │                     │
  ├─ Click +1 ────────▶│                     │
  │                    │                     │
  │                    ├─ PATCH /cart/items/5
  │                    │   {quantity: 3}     │
  │                    │                     │
  │                    │                     ├─ Update cart_item
  │                    │                     │
  │                    │◀── {cart_item} ─────┤
  │                    │                     │
  │                    ├─ Reload cart        │
```

### 5. Checkout

```
User                Frontend              Backend              Database
  │                    │                     │                     │
  ├─ Navigate /checkout│                     │                     │
  │   (guard check) ───▶                     │                     │
  │                    │                     │                     │
  ├─ Fill form ────────▶                     │                     │
  │   - Customer info  │                     │                     │
  │   - Address        │                     │                     │
  │   - Privacy        │                     │                     │
  │                    │                     │                     │
  ├─ Submit ──────────▶│                     │                     │
  │                    │                     │                     │
  │                    ├─ POST /api/orders ─▶│                     │
  │                    │   {customer: {...}, │                     │
  │                    │    address: {...}}  │                     │
  │                    │                     │                     │
  │                    │                 ┌───┴─────────────────────┐
  │                    │                 │ ActiveRecord Transaction│
  │                    │                 │                         │
  │                    │                 │ 1. Validate cart !empty │
  │                    │                 │                         │
  │                    │                 │ 2. Order.create(...)    │
  │                    │                 │                         │
  │                    │                 │ 3. cart_items.each do   │
  │                    │                 │      OrderItem.create() │
  │                    │                 │      product.decrement! │
  │                    │                 │    end                  │
  │                    │                 │                         │
  │                    │                 │ 4. cart.clear_items()   │
  │                    │                 │                         │
  │                    │                 │ 5. Commit transaction   │
  │                    │                 └─────────────────────────┘
  │                    │                     │                     │
  │                    │◀── {order} ─────────┤                     │
  │                    │                     │                     │
  │                    ├─ Navigate /orders   │                     │
  │                    ├─ Show success msg   │                     │
  │                    ├─ Reset cart signal  │                     │
  │                    │                     │                     │
  │◀── Order confirmed!                      │                     │
```

**Transaction garantisce:**
- Atomicità: tutto succede o nulla succede
- Se fallisce (es. stock insufficiente), rollback completo
- Decremento quantità prodotti contestuale

### 6. Visualizzazione Storico Ordini

```
User                Frontend              Backend
  │                    │                     │
  ├─ Navigate /orders─▶│                     │
  │                    │                     │
  │                    ├─ GET /api/orders ──▶│
  │                    │                     │
  │                    │                     ├─ If admin:
  │                    │                     │   Order.all
  │                    │                     │ Else:
  │                    │                     │   current_user.orders
  │                    │                     │
  │                    │◀── [{orders}] ──────┤
  │                    │                     │
  │◀── Display orders                        │
```

## Protezione e Sicurezza

### Backend

**ApplicationController:**
```ruby
class ApplicationController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    header = request.headers['Authorization']
    token = header&.split(' ')&.last

    decoded = JWT.decode(token, Rails.application.secret_key_base).first
    @current_user = User.find(decoded['user_id'])
  rescue
    @current_user = nil
  end

  def require_authentication!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_user
  end

  def require_admin!
    require_authentication!
    render json: { error: 'Forbidden' }, status: :forbidden unless @current_user&.admin?
  end
end
```

**Uso:**
```ruby
class CartsController < ApplicationController
  before_action :require_authentication! # Tutte le azioni protette
end

class Admin::ProductsController < ApplicationController
  before_action :require_admin! # Solo admin
end
```

### Frontend

**AuthInterceptor:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

**Guards:**
```typescript
// checkout-guard
export const checkoutGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

// admin-guard
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/products']);
    return false;
  }

  return true;
};
```

**Routes:**
```typescript
{
  path: 'checkout',
  canActivate: [checkoutGuardGuard],
  loadComponent: () => import('./features/checkout/checkout-page')
},
{
  path: 'admin',
  canActivate: [adminGuard],
  loadComponent: () => import('./features/admin/admin-dashboard')
}
```

## Gestione Errori

### Backend

**Validazioni Model:**
```ruby
class Product < ApplicationRecord
  validates :title, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
end
```

**Risposta errore:**
```json
{
  "error": "Validation failed",
  "details": [
    "Title can't be blank",
    "Price must be greater than 0"
  ]
}
```

**Status HTTP:**
- 400 Bad Request: parametri mancanti/invalidi
- 401 Unauthorized: token mancante/scaduto
- 403 Forbidden: permessi insufficienti (non admin)
- 404 Not Found: risorsa non trovata
- 422 Unprocessable Entity: validazioni fallite
- 500 Internal Server Error: errore server

### Frontend

**Gestione errore service:**
```typescript
createOrder(data: CheckoutData): Observable<Order> {
  return this.http.post<Order>(`${baseUrl}/orders`, data).pipe(
    catchError(error => {
      console.error('Order creation failed:', error);
      // Mostrare messaggio utente
      return throwError(() => error);
    })
  );
}
```

**Gestione errore component:**
```typescript
onSubmit() {
  this.orderService.create(this.form.value).subscribe({
    next: (order) => {
      this.router.navigate(['/orders']);
    },
    error: (err) => {
      this.errorMessage = err.error?.error || 'Order failed';
    }
  });
}
```

## Performance e Ottimizzazioni

### Backend

**Eager Loading:**
```ruby
# Evita N+1 queries
Order.includes(:user, order_items: :product).all
Cart.includes(cart_items: :product).find_by(user: current_user)
```

**Indici Database:**
```ruby
add_index :cart_items, [:cart_id, :product_id], unique: true
add_index :orders, :user_id
add_index :products, :quantity # Per filtri low stock
```

### Frontend

**Lazy Loading Routes:**
```typescript
{
  path: 'products',
  loadComponent: () => import('./features/products/product-page')
}
```

**Angular Signals (Change Detection Ottimizzata):**
```typescript
// Invece di Observable + AsyncPipe
cartSignal = signal<Cart>({ items: [], total: 0 });
total = computed(() => this.cartSignal().total);
```

**Debounce Search:**
```typescript
searchControl.valueChanges.pipe(
  debounceTime(200), // Aspetta 200ms dopo ultima digitazione
  distinctUntilChanged()
).subscribe(...)
```

## Scalabilità e Produzione

### Limitazioni Attuali

1. **Database SQLite:**
   - File-based
   - Scritture sequenziali (no concurrency)
   - **Soluzione:** Migrare a PostgreSQL

2. **Nessun Caching:**
   - Lista prodotti ricaricata ogni volta
   - **Soluzione:** Redis per cache API responses

3. **Paginazione Frontend:**
   - Tutti i prodotti caricati in memoria
   - **Soluzione:** Paginazione backend con `kaminari` gem

4. **Nessun Job Background:**
   - Operazioni sincrone
   - **Soluzione:** Sidekiq per email, report, export

### Migrazioni Consigliate

**PostgreSQL:**
```yaml
# config/database.yml
production:
  adapter: postgresql
  database: <%= ENV['DB_NAME'] %>
  username: <%= ENV['DB_USER'] %>
  password: <%= ENV['DB_PASS'] %>
  host: <%= ENV['DB_HOST'] %>
  pool: 5
```

**Redis Caching:**
```ruby
# config/environments/production.rb
config.cache_store = :redis_cache_store, { url: ENV['REDIS_URL'] }

# Controller
def index
  @products = Rails.cache.fetch('products/all', expires_in: 1.hour) do
    Product.all.to_a
  end
end
```

**Paginazione Backend:**
```ruby
# Gemfile
gem 'kaminari'

# Controller
def index
  page = params[:page]&.to_i || 1
  per_page = params[:per_page]&.to_i || 20

  products = Product.page(page).per(per_page)

  render json: {
    products: products,
    total_pages: products.total_pages,
    current_page: page
  }
end
```

## Conclusioni

Architettura moderna e scalabile con separazione netta frontend/backend. Autenticazione JWT stateless, validazioni complete, protezione route multi-livello.

Punti di forza:
- API RESTful ben strutturate
- Autenticazione robusta
- Validazioni sia client che server
- Transaction per operazioni critiche
- Guards e interceptor Angular

Aree di miglioramento per produzione:
- Database production-ready (PostgreSQL)
- Caching (Redis)
- Background jobs (Sidekiq)
- Monitoring (Sentry, New Relic)
- CI/CD pipeline
```

---

## 8. PIANO DI IMPLEMENTAZIONE

### 📅 Sequenza Attività Consigliate

#### FASE 1: Completamento Base (Priorità Alta)

**Settimana 1:**

**Giorno 1-2: Backend - Filtri Prodotti + Endpoint Ordini**
- [ ] Implementare filtro tag/ricerca testuale in `ProductsController#index`
- [ ] Implementare paginazione backend (opzionale, gem Kaminari)
- [ ] Aggiungere endpoint `GET /api/orders/:id` per utente
- [ ] Aggiungere campo `status` a Order (migration)
- [ ] Test: `spec/requests/products_spec.rb` (filtri)

**Giorno 3-4: Testing Backend**
- [ ] Scrivere test modelli: `product_spec.rb`, `order_spec.rb`
- [ ] Scrivere test request: `orders_spec.rb`, `cart_items_spec.rb`
- [ ] Configurare FactoryBot se non presente
- [ ] Eseguire `bundle exec rspec` → tutto verde

**Giorno 5-7: Documentazione Base**
- [ ] Scrivere README.md completo (sezioni 1-6 minime)
- [ ] Documentare prerequisiti e setup
- [ ] Documentare API endpoints principali
- [ ] Credenziali demo

#### FASE 2: Funzionalità Avanzata (Priorità Alta)

**Settimana 2:**

**OPZIONE A: Wishlist (6-8 ore)**
- [ ] Giorno 1-2: Backend
  - [ ] Migration: Wishlist, WishlistItem
  - [ ] Modelli con validazioni
  - [ ] Controller `Api::WishlistsController`
  - [ ] Routes
  - [ ] Test modelli e request

- [ ] Giorno 3-4: Frontend
  - [ ] `WishlistService` con signals
  - [ ] `WishlistPage` component
  - [ ] UI: icona cuore su ProductCard
  - [ ] Badge counter su header
  - [ ] Route `/wishlist` con guard

- [ ] Giorno 5: Integrazione e test
  - [ ] Test manuale flusso completo
  - [ ] Fix bug
  - [ ] Aggiornare README con descrizione wishlist

**OPZIONE B: Internazionalizzazione (8-10 ore)**
- [ ] Giorno 1: Backend i18n
  - [ ] Config Rails i18n (it, en)
  - [ ] File `config/locales/it.yml`, `en.yml`
  - [ ] Update controller con `I18n.t()`
  - [ ] Interceptor locale in `ApplicationController`

- [ ] Giorno 2-3: Frontend i18n
  - [ ] Setup Angular i18n (`@angular/localize`)
  - [ ] Marcare template con attributi `i18n`
  - [ ] Estrarre messaggi: `ng extract-i18n`
  - [ ] Tradurre `messages.it.xlf`

- [ ] Giorno 4: Language Switcher
  - [ ] `LanguageService` con signal
  - [ ] `LanguageSwitcher` component in header
  - [ ] Interceptor HTTP per `Accept-Language`
  - [ ] Config build per locali

- [ ] Giorno 5: Test e build
  - [ ] Build con `ng build --localize`
  - [ ] Test manuale switch lingua
  - [ ] Verificare traduzioni backend
  - [ ] Aggiornare README

#### FASE 3: Testing Completo (Priorità Media)

**Settimana 3 (solo se tempo):**

**Backend:**
- [ ] Aggiungere 2-3 test modelli aggiuntivi
- [ ] Test controller admin
- [ ] Coverage report con SimpleCov
- [ ] Raggiungere almeno 70% coverage modelli critici

**Frontend (Opzionale - Funzionalità Avanzata):**
- [ ] Test service: `cart.service.spec.ts`, `auth.service.spec.ts`
- [ ] Test component: `product-page.spec.ts`, `checkout-page.spec.ts`
- [ ] Eseguire `ng test` → verificare pass

**E2E (Opzionale - Bonus):**
- [ ] Setup Protractor/Cypress
- [ ] Scenario: Login → Add Cart → Checkout → Order
- [ ] Eseguire `ng e2e`

#### FASE 4: Documentazione Finale (Priorità Alta)

**Settimana 4:**

**Giorno 1-2:**
- [ ] Completare README.md:
  - [ ] Sezione Testing con comandi e risultati
  - [ ] Sezione Funzionalità Avanzate con descrizione completa
  - [ ] Sezione Deployment/Production notes
  - [ ] Screenshots (opzionale)

**Giorno 3:**
- [ ] Scrivere ARCHITETTURA.md:
  - [ ] Diagrammi modelli
  - [ ] Flusso autenticazione
  - [ ] Flusso carrello → ordine
  - [ ] Scelte tecnologiche

**Giorno 4:**
- [ ] Docker Compose (opzionale ma apprezzato)
  - [ ] `docker-compose.yml` per backend + frontend
  - [ ] Testare `docker-compose up`
  - [ ] Documentare nel README

**Giorno 5:**
- [ ] Review finale:
  - [ ] Codice pulito (no commenti debug)
  - [ ] Console.log rimossi
  - [ ] Formattazione coerente
  - [ ] Git commit messages chiare
  - [ ] .gitignore corretto (no secrets, node_modules, tmp)

#### FASE 5: Miglioramenti Opzionali (Priorità Bassa)

**Solo se avanza tempo:**
- [ ] Gestione stati ordini (pending, shipped, delivered)
- [ ] Pagina dettaglio ordine più ricca
- [ ] Export ordini CSV (admin)
- [ ] Charts dashboard admin (Chart.js/ng2-charts)
- [ ] Filtri avanzati prodotti (multi-tag, range prezzo slider)
- [ ] Storicizzazione prezzi prodotti
- [ ] Review e rating prodotti

---

## 9. TIMELINE SUGGERITA

### Pianificazione Totale: 4 Settimane

```
SETTIMANA 1: Base + Testing Backend
├─ Giorni 1-2: Endpoints mancanti + Stati ordini
├─ Giorni 3-4: Test backend (modelli + requests)
└─ Giorni 5-7: README base + Setup doc

SETTIMANA 2: Funzionalità Avanzata
├─ Wishlist: Giorni 1-2 Backend, 3-4 Frontend, 5 Test
└─ i18n: Giorni 1 Backend, 2-3 Frontend, 4 Switcher, 5 Test

SETTIMANA 3: Testing Frontend (Opzionale) + Miglioramenti
├─ Giorni 1-3: Test service + component (se funzionalità avanzata)
├─ Giorni 4-5: E2E test (se bonus)
└─ O: Miglioramenti UX/UI, refactoring

SETTIMANA 4: Documentazione + Review Finale
├─ Giorni 1-2: README completo
├─ Giorno 3: ARCHITETTURA.md
├─ Giorno 4: Docker Compose (opzionale)
└─ Giorno 5: Review codice, cleanup, commit finale
```

### Milestone Critiche

| Milestone | Deadline | Deliverable |
|-----------|----------|-------------|
| **M1: Base Completo** | Fine Settimana 1 | Backend funzionante, test minimi, README base |
| **M2: Funzionalità Avanzata** | Fine Settimana 2 | Wishlist O i18n completamente implementata |
| **M3: Testing** | Fine Settimana 3 | Test backend completi, frontend opzionali |
| **M4: Consegna** | Fine Settimana 4 | Documentazione completa, progetto pronto |

---

## 10. CHECKLIST FINALE

### ✅ Requisiti Obbligatori

#### Backend Rails

- [ ] Progetto creato come API (`rails new --api`)
- [ ] Database relazionale configurato (SQLite OK per sviluppo)
- [ ] Modelli con validazioni complete:
  - [ ] Product (title, price, quantity validati)
  - [ ] User (email, password validati)
  - [ ] Cart, CartItem
  - [ ] Order, OrderItem
- [ ] Gestione errori con status HTTP corretti (400, 401, 403, 404, 422)
- [ ] **Test minimo:**
  - [ ] Almeno 1 test modello
  - [ ] Almeno 1 test request/controller
- [ ] Endpoints prodotti:
  - [ ] GET /products (con almeno UNO tra: filtro tag, ricerca testuale, paginazione)
  - [ ] GET /products/:id
- [ ] Endpoints carrello:
  - [ ] GET /cart
  - [ ] POST /cart/items
  - [ ] PATCH /cart/items/:id
  - [ ] DELETE /cart/items/:id
- [ ] Endpoints ordini:
  - [ ] POST /orders (crea ordine, svuota carrello)
  - [ ] GET /orders (lista ordini utente)
  - [ ] GET /orders/:id (dettaglio ordine)
- [ ] Autenticazione reale:
  - [ ] POST /register
  - [ ] POST /login (ritorna JWT)
  - [ ] GET /me (profilo utente)
  - [ ] Middleware autenticazione funzionante
  - [ ] Protezione admin con ruoli

#### Frontend Angular

- [ ] NO dati hardcoded (prodotti, carrello, ordini da API)
- [ ] Servizi dedicati:
  - [ ] ProductService/ProductApi
  - [ ] CartService
  - [ ] OrderService
  - [ ] AuthService
- [ ] Reactive Forms per checkout
- [ ] HttpClient per tutte le chiamate API
- [ ] HttpInterceptor per token JWT
- [ ] Guard per proteggere route:
  - [ ] /checkout richiede login
  - [ ] /admin richiede ruolo admin
- [ ] Pagine:
  - [ ] Lista prodotti
  - [ ] Dettaglio prodotto
  - [ ] Carrello
  - [ ] Checkout con form validato
  - [ ] Login
  - [ ] Lista ordini (obbligatoria)
- [ ] Gestione feedback utente:
  - [ ] Loading spinner durante chiamate
  - [ ] Messaggio successo ordine
  - [ ] Messaggio errore

#### Funzionalità Avanzate

- [ ] **Area Admin** (già presente):
  - [ ] Dashboard con statistiche
  - [ ] CRUD prodotti completo
  - [ ] Gestione inventario
  - [ ] Visualizzazione/cancellazione ordini
  - [ ] Protezione backend (`require_admin!`) e frontend (guard)

- [ ] **Seconda funzionalità avanzata** (OBBLIGATORIA - sceglierne UNA):
  - [ ] **Wishlist:**
    - [ ] Backend: modelli Wishlist, WishlistItem
    - [ ] Backend: endpoints CRUD wishlist
    - [ ] Frontend: servizio WishlistService
    - [ ] Frontend: pagina /wishlist
    - [ ] Frontend: icona cuore su prodotti
  - [ ] **Internazionalizzazione:**
    - [ ] Backend: Rails i18n (it.yml, en.yml)
    - [ ] Backend: locale files per errori
    - [ ] Frontend: Angular i18n setup
    - [ ] Frontend: file traduzioni (it, en)
    - [ ] Frontend: Language switcher in header
    - [ ] Build separati per locale

#### Documentazione

- [ ] **README.md** con:
  - [ ] Prerequisiti (versioni Ruby, Rails, Node, Angular)
  - [ ] Istruzioni setup database (`rails db:migrate db:seed`)
  - [ ] Istruzioni avvio backend (`rails server`)
  - [ ] Istruzioni avvio frontend (`ng serve`)
  - [ ] Credenziali demo (admin, user)
  - [ ] Comandi test (`bundle exec rspec`, `ng test`)

- [ ] **ARCHITETTURA.md** (o sezione README) con:
  - [ ] Modelli dominio (Product, User, Cart, Order, ecc.)
  - [ ] Flusso login → carrello → checkout → ordine
  - [ ] Descrizione funzionalità avanzate implementate
  - [ ] Scelte tecnologiche (JWT, SQLite, perché)

#### Testing

- [ ] **Backend (minimo):**
  - [ ] 1 test modello (es. Product validazioni)
  - [ ] 1 test request (es. POST /orders)
  - [ ] Tutti i test passano (`bundle exec rspec`)

- [ ] **Frontend (opzionale ma consigliato):**
  - [ ] 2 test service (se funzionalità avanzata test scelta)
  - [ ] 2 test component (se funzionalità avanzata test scelta)

#### Consegna

- [ ] Repository Git organizzato:
  - [ ] `Backend/` cartella progetto Rails
  - [ ] `Frontend/` cartella progetto Angular
  - [ ] README.md nella root
  - [ ] ARCHITETTURA.md (o sezione README)
  - [ ] .gitignore corretto (no secrets, node_modules, db/*.sqlite3)

- [ ] (Opzionale ma apprezzato):
  - [ ] docker-compose.yml funzionante
  - [ ] Screenshots in README
  - [ ] File Postman collection per API

### 🎯 Criteri di Valutazione (Riferimento)

| Categoria | Punti Max | Check |
|-----------|-----------|-------|
| **Backend Rails** | 10 | [ ] API REST, modello dati, validazioni, gestione errori, test minimi |
| **Frontend Angular** | 10 | [ ] Integrazione API, gestione carrello/ordini, checkout funzionante |
| **Funzionalità Avanzate** | 5 | [ ] 1 funzionalità avanzata completata (Area Admin + Wishlist/i18n) |
| **Qualità & Documentazione** | 2 | [ ] Codice pulito, README completo, ARCHITETTURA chiara |
| **Bonus (2a funzionalità)** | +bonus | [ ] Eventuale seconda funzionalità avanzata |
| **TOTALE** | 27/30 | [ ] (30 e lode con bonus) |

---

## RIEPILOGO AZIONI IMMEDIATE

### 🔥 DA FARE SUBITO (Questa Settimana)

1. **Backend:**
   - [ ] Aggiungere filtro tag O ricerca testuale in `GET /products`
   - [ ] Aggiungere `GET /api/orders/:id` per utente
   - [ ] Scrivere test: `spec/models/product_spec.rb`, `spec/requests/orders_spec.rb`

2. **Documentazione:**
   - [ ] Scrivere README.md base (prerequisiti, setup, credenziali)
   - [ ] Testare che qualcuno possa clonare e avviare il progetto

3. **Scelta Funzionalità Avanzata:**
   - [ ] Decidere: Wishlist O Internazionalizzazione
   - [ ] Iniziare implementazione backend

### 📌 PROSSIMI PASSI (Settimana 2)

1. **Completare Funzionalità Avanzata scelta**
2. **Testing completo backend**
3. **README dettagliato**
4. **ARCHITETTURA.md**

### 🎓 PREPARAZIONE PROVA ORALE

Aspetti da ripassare prima della discussione:

1. **Scelte progettuali:**
   - Perché JWT invece di session-based auth?
   - Perché separare frontend/backend?
   - Limitazioni SQLite in produzione

2. **Modello dati:**
   - Relazioni tra modelli
   - Perché `user_id` nullable in Order?
   - Differenza Cart vs Order

3. **Autenticazione:**
   - Come funziona JWT?
   - Dove viene salvato token?
   - Come viene verificato nel backend?

4. **Carrello persistente:**
   - Differenza vs localStorage
   - Quando viene svuotato?
   - Validazione stock

5. **Funzionalità avanzata:**
   - Descrivere implementazione backend
   - Descrivere implementazione frontend
   - Difficoltà incontrate

---

## NOTE FINALI

### 💡 Consigli Generali

1. **Non over-engineer:** Implementa solo ciò che è richiesto, mantieni semplicità
2. **Test early:** Scrivi test man mano, non alla fine
3. **Commit frequenti:** Git commit con messaggi chiari dopo ogni feature
4. **Documentazione progressiva:** Aggiorna README mentre sviluppi
5. **Chiedi dubbi:** Se qualcosa non è chiaro nelle specifiche, chiedi al docente

### ⚠️ Errori Comuni da Evitare

- ❌ Hardcodare prodotti/carrello nel frontend
- ❌ Non testare affatto (RSpec configurato ma vuoto)
- ❌ README incompleto (impossibile avviare progetto)
- ❌ Secrets committati (token, password in chiaro)
- ❌ Funzionalità avanzata solo abbozzata
- ❌ Admin area senza protezione reale
- ❌ Validazioni solo client-side (sempre anche server!)

### 🚀 Opportunità Bonus

Se vuoi eccellere (30 e lode):

- Implementa SECONDA funzionalità avanzata
- Test coverage > 80%
- Docker Compose funzionante
- Deployment su Heroku/Railway con istruzioni
- CI/CD pipeline (GitHub Actions)
- Documentazione con diagrammi UML/ER

### 📞 Supporto

Per dubbi su questo piano operativo o specifiche del progetto:
- Rivedi le specifiche PDF
- Consulta docente durante ricevimento
- Verifica esempi laboratorio

---

**Buon lavoro! 🎯**

*Questo piano è stato generato analizzando il tuo progetto esistente e le specifiche del corso. Segui i passi in ordine e raggiungerai tutti i requisiti.*
