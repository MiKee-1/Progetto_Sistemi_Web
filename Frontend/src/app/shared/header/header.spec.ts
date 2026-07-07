import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../core/services/auth-service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

const isLoggedInSignal = signal(false);
const currentUserSignal = signal<any>(null);
const cartItemCountSignal = signal(0);
const wishlistItemCountSignal = signal(0);

const mockAuthService = {
  isLoggedIn: isLoggedInSignal,
  currentUser: currentUserSignal,
  logout: vi.fn(),
};
const mockCartService = { itemCount: cartItemCountSignal, resetCart: vi.fn() };
const mockWishlistService = { itemCount: wishlistItemCountSignal, resetWishlist: vi.fn() };

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    isLoggedInSignal.set(false);
    currentUserSignal.set(null);
    cartItemCountSignal.set(0);
    wishlistItemCountSignal.set(0);
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CartService, useValue: mockCartService },
        { provide: WishlistService, useValue: mockWishlistService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isAdmin is true when current user has admin role', () => {
    currentUserSignal.set({ role: 'admin' });
    expect(component.isAdmin()).toBe(true);
  });

  it('isAdmin is false when current user has user role', () => {
    currentUserSignal.set({ role: 'user' });
    expect(component.isAdmin()).toBe(false);
  });

  it('isAdmin is false when no user is logged in', () => {
    expect(component.isAdmin()).toBe(false);
  });

  it('cartItemCount reflects the cart service itemCount signal', () => {
    cartItemCountSignal.set(3);
    expect(component.cartItemCount()).toBe(3);
  });

  it('wishlistItemCount reflects the wishlist service itemCount signal', () => {
    wishlistItemCountSignal.set(5);
    expect(component.wishlistItemCount()).toBe(5);
  });

  it('goToCart navigates to /cart', () => {
    component.goToCart();
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('goToCheckout navigates to /checkout', () => {
    component.goToCheckout();
    expect(router.navigate).toHaveBeenCalledWith(['/checkout']);
  });

  it('goToHome navigates to /', () => {
    component.goToHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('goToLogin navigates to /login', () => {
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('goToRegister navigates to /register', () => {
    component.goToRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('goToAdmin navigates to /admin', () => {
    component.goToAdmin();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('goToOrders navigates to /orders', () => {
    component.goToOrders();
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  });

  it('goToWishlist navigates to /wishlist', () => {
    component.goToWishlist();
    expect(router.navigate).toHaveBeenCalledWith(['/wishlist']);
  });

  it('logout calls authService.logout, resets cart and wishlist, navigates to /products', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockCartService.resetCart).toHaveBeenCalled();
    expect(mockWishlistService.resetWishlist).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
