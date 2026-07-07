import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { WishlistService } from './wishlist.service';
import { AuthService } from './auth-service';

const mockItem = { id: 1, productId: 'prod-1' } as any;
const mockWishlist = { id: 1, items: [mockItem], itemCount: 1 } as any;
const mockAuthNotLoggedIn = { isLoggedIn: () => false };

describe('WishlistService', () => {
  let service: WishlistService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthNotLoggedIn },
      ],
    });
    service = TestBed.inject(WishlistService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('does not call loadWishlist on init when user is not logged in', () => {
    httpController.expectNone('http://localhost:3000/api/wishlist');
  });

  it('loadWishlist sends GET /api/wishlist and updates wishlist signal', () => {
    service.loadWishlist();
    httpController.expectOne('http://localhost:3000/api/wishlist').flush(mockWishlist);
    expect(service.wishlist()).toEqual(mockWishlist);
    expect(service.itemCount()).toBe(1);
  });

  it('addToWishlist sends POST /api/wishlist/items with product_id', () => {
    const response = { wishlist: mockWishlist };
    service.addToWishlist('prod-1').subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/wishlist/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product_id: 'prod-1' });
    req.flush(response);
    expect(service.wishlist()).toEqual(mockWishlist);
  });

  it('removeItem sends DELETE /api/wishlist/items/:id and updates signal', () => {
    const emptyWishlist = { ...mockWishlist, items: [], itemCount: 0 };
    service.removeItem(1).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/wishlist/items/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ wishlist: emptyWishlist });
    expect(service.items()).toHaveLength(0);
  });

  it('isInWishlist returns true when product is in wishlist items', () => {
    service.loadWishlist();
    httpController.expectOne('http://localhost:3000/api/wishlist').flush(mockWishlist);
    expect(service.isInWishlist('prod-1')).toBe(true);
    expect(service.isInWishlist('prod-99')).toBe(false);
  });

  it('resetWishlist sets wishlist and error signals to null', () => {
    service.resetWishlist();
    expect(service.wishlist()).toBeNull();
    expect(service.error()).toBeNull();
  });
});
