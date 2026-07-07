import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { CartPage } from './cart-page';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart';

const mockItem = { id: 1, quantity: 2, product: { id: 'p1', title: 'Widget' } } as unknown as CartItem;

const mockSnackBar = { open: vi.fn() };
const mockCartService = {
  cart: vi.fn().mockReturnValue(null),
  loading: vi.fn().mockReturnValue(false),
  error: vi.fn().mockReturnValue(null),
  items: vi.fn().mockReturnValue([]),
  total: vi.fn().mockReturnValue(0),
  itemCount: vi.fn().mockReturnValue(0),
  isEmpty: vi.fn().mockReturnValue(true),
  loadCart: vi.fn(),
  incrementQuantity: vi.fn(),
  decrementQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
};

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    router = { navigate: vi.fn() };
    mockCartService.incrementQuantity.mockReturnValue(of({}));
    mockCartService.decrementQuantity.mockReturnValue(of({}));
    mockCartService.removeItem.mockReturnValue(of({}));
    mockCartService.clearCart.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: CartService, useValue: mockCartService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    // MatSnackBarModule importato dal componente fornirebbe la propria istanza
    TestBed.overrideProvider(MatSnackBar, { useValue: mockSnackBar });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit reloads the cart', () => {
    component.ngOnInit();
    expect(mockCartService.loadCart).toHaveBeenCalled();
  });

  it('incrementQuantity delegates to the service and shows a confirmation', () => {
    component.incrementQuantity(mockItem);
    expect(mockCartService.incrementQuantity).toHaveBeenCalledWith(mockItem.id, mockItem.quantity);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Quantity updated', 'Close', expect.any(Object));
  });

  it('incrementQuantity shows the backend detail message on error', () => {
    mockCartService.incrementQuantity.mockReturnValue(
      throwError(() => ({ error: { details: ['exceeds available stock'] } }))
    );
    component.incrementQuantity(mockItem);
    expect(mockSnackBar.open).toHaveBeenCalledWith('exceeds available stock', 'Close', expect.any(Object));
  });

  it('decrementQuantity on a quantity-1 item announces the removal', () => {
    component.decrementQuantity({ ...mockItem, quantity: 1 } as CartItem);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Item removed', 'Close', expect.any(Object));
  });

  it('decrementQuantity on a higher quantity announces the update', () => {
    component.decrementQuantity(mockItem);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Quantity updated', 'Close', expect.any(Object));
  });

  it('removeItem delegates to the service', () => {
    component.removeItem(mockItem);
    expect(mockCartService.removeItem).toHaveBeenCalledWith(mockItem.id);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Item removed from cart', 'Close', expect.any(Object));
  });

  it('clearCart asks for confirmation before clearing', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.clearCart();
    expect(mockCartService.clearCart).toHaveBeenCalled();
  });

  it('clearCart does nothing when the user cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.clearCart();
    expect(mockCartService.clearCart).not.toHaveBeenCalled();
  });

  it('goToCheckout and continueShopping navigate to the right routes', () => {
    component.goToCheckout();
    expect(router.navigate).toHaveBeenCalledWith(['/checkout']);
    component.continueShopping();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
