import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { AuthService } from './auth-service';

const mockCart = { id: 1, items: [], total: 0, itemCount: 0 } as any;
const mockAuthNotLoggedIn = { isLoggedIn: () => false };

describe('CartService', () => {
  let service: CartService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthNotLoggedIn },
      ],
    });
    service = TestBed.inject(CartService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('does not call loadCart on init when user is not logged in', () => {
    httpController.expectNone('http://localhost:3000/api/cart');
  });

  it('loadCart sends GET /api/cart and updates cart signal', () => {
    service.loadCart();
    httpController.expectOne('http://localhost:3000/api/cart').flush(mockCart);
    expect(service.cart()).toEqual(mockCart);
  });

  it('loadCart sets loading to true during request and false after', () => {
    service.loadCart();
    expect(service.loading()).toBe(true);
    httpController.expectOne('http://localhost:3000/api/cart').flush(mockCart);
    expect(service.loading()).toBe(false);
  });

  it('addToCart sends POST /api/cart/items and updates cart signal', () => {
    const response = { cart: { ...mockCart, itemCount: 1 } };
    service.addToCart('product-1', 2).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/cart/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product_id: 'product-1', quantity: 2 });
    req.flush(response);
    expect(service.cart()).toEqual(response.cart);
  });

  it('updateQuantity sends PATCH /api/cart/items/:id with quantity', () => {
    const response = { cart: mockCart };
    service.updateQuantity(42, 3).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/cart/items/42');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantity: 3 });
    req.flush(response);
  });

  it('removeItem sends DELETE /api/cart/items/:id and updates cart signal', () => {
    const response = { cart: mockCart };
    service.removeItem(7).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/cart/items/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(response);
    expect(service.cart()).toEqual(mockCart);
  });

  it('clearCart sends DELETE /api/cart and updates cart signal', () => {
    const response = { cart: mockCart };
    service.clearCart().subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('DELETE');
    req.flush(response);
    expect(service.cart()).toEqual(mockCart);
  });

  it('decrementQuantity calls removeItem when quantity is 1', () => {
    const response = { cart: mockCart };
    service.decrementQuantity(5, 1).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/cart/items/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(response);
  });

  it('resetCart sets cart and error signals to null', () => {
    service.resetCart();
    expect(service.cart()).toBeNull();
    expect(service.error()).toBeNull();
  });
});
