import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { WishlistPage } from './wishlist-page';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistItem } from '../../../core/models/wishlist';

const mockItem = {
  id: 7,
  productId: 'p1',
  product: { id: 'p1', title: 'Widget' },
} as unknown as WishlistItem;

const mockSnackBar = { open: vi.fn() };
const mockWishlistService = {
  loading: vi.fn().mockReturnValue(false),
  error: vi.fn().mockReturnValue(null),
  items: vi.fn().mockReturnValue([]),
  itemCount: vi.fn().mockReturnValue(0),
  isEmpty: vi.fn().mockReturnValue(true),
  loadWishlist: vi.fn(),
  removeItem: vi.fn(),
  clearWishlist: vi.fn(),
};
const mockCartService = { addToCart: vi.fn() };

describe('WishlistPage', () => {
  let component: WishlistPage;
  let fixture: ComponentFixture<WishlistPage>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    router = { navigate: vi.fn() };
    mockWishlistService.removeItem.mockReturnValue(of({}));
    mockWishlistService.clearWishlist.mockReturnValue(of({}));
    mockCartService.addToCart.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      imports: [WishlistPage],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: WishlistService, useValue: mockWishlistService },
        { provide: CartService, useValue: mockCartService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: mockSnackBar });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads the wishlist', () => {
    component.ngOnInit();
    expect(mockWishlistService.loadWishlist).toHaveBeenCalled();
  });

  it('removeItem delegates to the service and confirms', () => {
    component.removeItem(mockItem);
    expect(mockWishlistService.removeItem).toHaveBeenCalledWith(mockItem.id);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Prodotto rimosso dalla wishlist', 'Chiudi', expect.any(Object));
  });

  it('removeItem shows an error snackbar on failure', () => {
    mockWishlistService.removeItem.mockReturnValue(throwError(() => new Error('boom')));
    component.removeItem(mockItem);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Errore nella rimozione', 'Chiudi', expect.any(Object));
  });

  it('moveToCart adds to the cart, removes from the wishlist and confirms', () => {
    component.moveToCart(mockItem);
    expect(mockCartService.addToCart).toHaveBeenCalledWith('p1');
    expect(mockWishlistService.removeItem).toHaveBeenCalledWith(mockItem.id);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Widget aggiunto al carrello', 'Chiudi', expect.any(Object));
  });

  it('moveToCart on failure shows the backend error and keeps the item', () => {
    mockCartService.addToCart.mockReturnValue(
      throwError(() => ({ error: { error: 'out of stock' } })));
    component.moveToCart(mockItem);
    expect(mockWishlistService.removeItem).not.toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('out of stock', 'Chiudi', expect.any(Object));
  });

  it('clearWishlist asks for confirmation before clearing', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.clearWishlist();
    expect(mockWishlistService.clearWishlist).toHaveBeenCalled();
  });

  it('clearWishlist does nothing when the user cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.clearWishlist();
    expect(mockWishlistService.clearWishlist).not.toHaveBeenCalled();
  });

  it('continueShopping navigates to the catalog', () => {
    component.continueShopping();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
