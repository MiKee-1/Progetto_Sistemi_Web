import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, firstValueFrom } from 'rxjs';
import { ProductDetailPage } from './product-detail-page';
import { ProductApi } from '../../../core/services/product-api';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product';

const mockProduct = {
  id: 'p1',
  title: 'Widget',
  tags: ['tech', 'home'],
  inStock: true,
  quantity: 5,
} as unknown as Product;

const catalog = [
  mockProduct,
  { id: 'p2', title: 'Widget 2', tags: ['tech'] },
  { id: 'p3', title: 'Widget 3', tags: ['home'] },
  { id: 'p4', title: 'Widget 4', tags: ['tech'] },
  { id: 'p5', title: 'Widget 5', tags: ['garden'] },
] as unknown as Product[];

const mockSnackBarRef = { onAction: vi.fn() };
const mockSnackBar = { open: vi.fn() };
const mockProductApi = { getById: vi.fn(), listAll: vi.fn() };
const mockCartService = { addToCart: vi.fn() };
const mockWishlistService = {
  isInWishlist: vi.fn(),
  items: vi.fn(),
  addToWishlist: vi.fn(),
  removeItem: vi.fn(),
};

describe('ProductDetailPage', () => {
  let component: ProductDetailPage;
  let fixture: ComponentFixture<ProductDetailPage>;
  let router: { navigate: ReturnType<typeof vi.fn>; url: string };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('scrollTo', vi.fn());
    router = { navigate: vi.fn().mockResolvedValue(true), url: '/product/p1' };
    mockSnackBarRef.onAction.mockReturnValue(of(void 0));
    mockSnackBar.open.mockReturnValue(mockSnackBarRef);
    mockProductApi.getById.mockReturnValue(of(mockProduct));
    mockProductApi.listAll.mockReturnValue(of(catalog));
    mockCartService.addToCart.mockReturnValue(of({}));
    mockWishlistService.isInWishlist.mockReturnValue(false);
    mockWishlistService.items.mockReturnValue([]);
    mockWishlistService.addToWishlist.mockReturnValue(of({}));
    mockWishlistService.removeItem.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      imports: [ProductDetailPage],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'p1' })) } },
        { provide: ProductApi, useValue: mockProductApi },
        { provide: CartService, useValue: mockCartService },
        { provide: WishlistService, useValue: mockWishlistService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: mockSnackBar });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ProductDetailPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('product$ resolves the product from the route id', async () => {
    const product = await firstValueFrom(component.product$);
    expect(mockProductApi.getById).toHaveBeenCalledWith('p1');
    expect(product).toEqual(mockProduct);
  });

  it('similarProducts$ returns up to 3 products sharing a tag, excluding the current one', async () => {
    const similar = await firstValueFrom(component.similarProducts$);
    expect(similar.map(p => p.id)).toEqual(['p2', 'p3', 'p4']);
  });

  it('similarProducts$ is empty when the product has no tags', async () => {
    mockProductApi.getById.mockReturnValue(of({ ...mockProduct, tags: [] }));
    const similar = await firstValueFrom(component.similarProducts$);
    expect(similar).toEqual([]);
  });

  it('navigateToProduct navigates to the product route', () => {
    component.navigateToProduct('p9');
    expect(router.navigate).toHaveBeenCalledWith(['/product', 'p9']);
  });

  // ─── onAddToCart ─────────────────────────────────────────────────────────

  it('onAddToCart refuses out-of-stock products', () => {
    component.onAddToCart({ ...mockProduct, inStock: false });
    expect(mockCartService.addToCart).not.toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Questo prodotto non è disponibile', 'Chiudi', expect.any(Object));
  });

  it('onAddToCart success confirms and navigates to the cart on action', () => {
    component.onAddToCart(mockProduct);
    expect(mockCartService.addToCart).toHaveBeenCalledWith('p1');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Widget aggiunto al carrello', 'Vai al carrello', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('onAddToCart on 401 prompts login with returnUrl', () => {
    mockCartService.addToCart.mockReturnValue(throwError(() => ({ status: 401 })));
    component.onAddToCart(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Effettua il login per aggiungere prodotti al carrello', 'Login', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/login'],
      { queryParams: { returnUrl: '/product/p1' } });
  });

  it('onAddToCart on other errors shows the backend message', () => {
    mockCartService.addToCart.mockReturnValue(
      throwError(() => ({ status: 422, error: { error: 'stock insufficiente' } })));
    component.onAddToCart(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'stock insufficiente', 'Chiudi', expect.any(Object));
  });

  // ─── onToggleWishlist ────────────────────────────────────────────────────

  it('onToggleWishlist removes the product when already in the wishlist', () => {
    mockWishlistService.isInWishlist.mockReturnValue(true);
    mockWishlistService.items.mockReturnValue([{ id: 7, productId: 'p1' }]);
    component.onToggleWishlist(mockProduct);
    expect(mockWishlistService.removeItem).toHaveBeenCalledWith(7);
    expect(mockWishlistService.addToWishlist).not.toHaveBeenCalled();
  });

  it('onToggleWishlist adds the product when not in the wishlist', () => {
    component.onToggleWishlist(mockProduct);
    expect(mockWishlistService.addToWishlist).toHaveBeenCalledWith('p1');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Widget aggiunto alla wishlist', 'Vai alla wishlist', expect.any(Object));
  });

  it('onToggleWishlist on 401 prompts login', () => {
    mockWishlistService.addToWishlist.mockReturnValue(throwError(() => ({ status: 401 })));
    component.onToggleWishlist(mockProduct);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Accedi per usare la wishlist', 'Login', expect.any(Object));
  });
});
