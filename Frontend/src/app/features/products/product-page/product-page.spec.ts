import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductPage } from './product-page';
import { ProductApi } from '../../../core/services/product-api';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../../core/models/product';

const mockProduct: Product = {
  id: '1',
  title: 'Laptop',
  description: 'A laptop',
  price: 999,
  originalPrice: 1299,
  sale: true,
  quantity: 5,
  inStock: true,
  createdAt: '2024-01-01',
  discountPercentage: 0,
};

const mockSnackBarRef = { onAction: vi.fn().mockReturnValue(of(void 0)) };
const mockSnackBar = { open: vi.fn().mockReturnValue(mockSnackBarRef) };
const mockProductApi = { list: vi.fn().mockReturnValue(of({ products: [], total: 0 })) };
const mockCartService = { addToCart: vi.fn() };
const mockWishlistService = {
  isInWishlist: vi.fn().mockReturnValue(false),
  items: vi.fn().mockReturnValue([]),
  removeItem: vi.fn(),
  addToWishlist: vi.fn(),
};

describe('ProductPage', () => {
  let component: ProductPage;
  let fixture: ComponentFixture<ProductPage>;
  let router: { navigate: ReturnType<typeof vi.fn>; url: string };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSnackBarRef.onAction.mockReturnValue(of(void 0));
    mockSnackBar.open.mockReturnValue(mockSnackBarRef);
    mockProductApi.list.mockReturnValue(of({ products: [], total: 0 }));
    mockWishlistService.isInWishlist.mockReturnValue(false);
    mockWishlistService.items.mockReturnValue([]);
    router = { navigate: vi.fn(), url: '/products' };

    await TestBed.configureTestingModule({
      imports: [ProductPage],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: ProductApi, useValue: mockProductApi },
        { provide: CartService, useValue: mockCartService },
        { provide: WishlistService, useValue: mockWishlistService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    // MatSnackBarModule (importato dal componente) fornisce una propria istanza di
    // MatSnackBar che scavalcherebbe il mock: overrideProvider vince anche su quella.
    TestBed.overrideProvider(MatSnackBar, { useValue: mockSnackBar });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ProductPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateTitle resets page to 1 and updates the title filter', () => {
    component.page$.next(3);
    component.updateTitle('laptop');
    expect(component.page$.value).toBe(1);
    expect((component as any).filters$.value.title).toBe('laptop');
  });

  it('updateMin resets page to 1 and updates the priceMin filter', () => {
    component.page$.next(2);
    component.updateMin('100');
    expect(component.page$.value).toBe(1);
    expect((component as any).filters$.value.priceMin).toBe('100');
  });

  it('updateMax resets page to 1 and updates the priceMax filter', () => {
    component.updateMax('500');
    expect((component as any).filters$.value.priceMax).toBe('500');
  });

  it('updateSort resets page to 1 and updates the sort filter', () => {
    component.page$.next(2);
    component.updateSort('priceAsc');
    expect(component.page$.value).toBe(1);
    expect((component as any).filters$.value.sort).toBe('priceAsc');
  });

  it('onPage updates page$ to pageIndex + 1', () => {
    component.onPage({ pageIndex: 2, pageSize: 9, length: 100 } as any);
    expect(component.page$.value).toBe(3);
  });

  it('navigateToTop calls window.scrollTo with top 0 and smooth behavior', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation((() => {}) as any);
    component.navigateToTop();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('onAddToCart shows out-of-stock snackbar when inStock is false', () => {
    component.onAddToCart({ ...mockProduct, inStock: false });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'This product is out of stock', 'Close', expect.any(Object)
    );
    expect(mockCartService.addToCart).not.toHaveBeenCalled();
  });

  it('onAddToCart shows out-of-stock snackbar when quantity is 0', () => {
    component.onAddToCart({ ...mockProduct, quantity: 0 });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'This product is out of stock', 'Close', expect.any(Object)
    );
    expect(mockCartService.addToCart).not.toHaveBeenCalled();
  });

  it('onAddToCart on success shows added-to-cart snackbar with product title', () => {
    mockCartService.addToCart.mockReturnValue(of({}));
    component.onAddToCart(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `${mockProduct.title} added to cart`, 'View Cart', expect.any(Object)
    );
  });

  it('onAddToCart on 401 error shows login prompt snackbar', () => {
    mockCartService.addToCart.mockReturnValue(throwError(() => ({ status: 401 })));
    component.onAddToCart(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Please login to add items to cart', 'Login', expect.any(Object)
    );
  });

  it('onAddToCart on other error shows error message from response', () => {
    mockCartService.addToCart.mockReturnValue(
      throwError(() => ({ status: 500, error: { error: 'Server error' } }))
    );
    component.onAddToCart(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Server error', 'Close', expect.any(Object));
  });

  it('onAddToCart on other error without message shows fallback', () => {
    mockCartService.addToCart.mockReturnValue(throwError(() => ({ status: 500 })));
    component.onAddToCart(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to add to cart', 'Close', expect.any(Object));
  });

  it('onAddToWishlist removes item when product is already in wishlist', () => {
    mockWishlistService.isInWishlist.mockReturnValue(true);
    mockWishlistService.items.mockReturnValue([{ id: 42, productId: '1' }]);
    mockWishlistService.removeItem.mockReturnValue(of({}));
    component.onAddToWishlist(mockProduct);
    expect(mockWishlistService.removeItem).toHaveBeenCalledWith(42);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `${mockProduct.title} rimosso dalla wishlist`, 'Chiudi', expect.any(Object)
    );
  });

  it('onAddToWishlist on success adds item and shows wishlist snackbar', () => {
    mockWishlistService.addToWishlist.mockReturnValue(of({}));
    component.onAddToWishlist(mockProduct);
    expect(mockWishlistService.addToWishlist).toHaveBeenCalledWith(mockProduct.id);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `${mockProduct.title} aggiunto alla wishlist`, 'Vai alla wishlist', expect.any(Object)
    );
  });

  it('onAddToWishlist on 401 error shows login prompt snackbar', () => {
    mockWishlistService.addToWishlist.mockReturnValue(throwError(() => ({ status: 401 })));
    component.onAddToWishlist(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Accedi per usare la wishlist', 'Login', expect.any(Object)
    );
  });

  it('onAddToWishlist on other error shows error message from response', () => {
    mockWishlistService.addToWishlist.mockReturnValue(
      throwError(() => ({ status: 500, error: { error: 'Wishlist error' } }))
    );
    component.onAddToWishlist(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Wishlist error', 'Chiudi', expect.any(Object));
  });

  it('onAddToWishlist on other error without message shows fallback', () => {
    mockWishlistService.addToWishlist.mockReturnValue(throwError(() => ({ status: 500 })));
    component.onAddToWishlist(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Errore', 'Chiudi', expect.any(Object));
  });
});
