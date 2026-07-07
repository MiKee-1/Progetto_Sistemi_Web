import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product';

const mockWishlistService = { isInWishlist: vi.fn() };

const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  description: 'A test product',
  price: 80,
  originalPrice: 100,
  sale: true,
  quantity: 10,
  inStock: true,
  createdAt: '2024-01-01',
  discountPercentage: 0,
};

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockWishlistService.isInWishlist.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: WishlistService, useValue: mockWishlistService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = mockProduct;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('addToCart emits the product via the add output', () => {
    const emitted: Product[] = [];
    component.add.subscribe(p => emitted.push(p));
    component.addToCart(mockProduct);
    expect(emitted).toEqual([mockProduct]);
  });

  it('toggleWishlist emits the product via the addWishlist output', () => {
    const emitted: Product[] = [];
    component.addWishlist.subscribe(p => emitted.push(p));
    component.toggleWishlist(mockProduct);
    expect(emitted).toEqual([mockProduct]);
  });

  it('isInWishlist delegates to wishlistService with the product id', () => {
    mockWishlistService.isInWishlist.mockReturnValue(true);
    expect(component.isInWishlist()).toBe(true);
    expect(mockWishlistService.isInWishlist).toHaveBeenCalledWith(mockProduct.id);
  });

  it('isInWishlist returns false when product is not in wishlist', () => {
    expect(component.isInWishlist()).toBe(false);
  });

  it('getDiscountPercentage returns 0 when originalPrice is falsy', () => {
    component.product = { ...mockProduct, originalPrice: 0 };
    expect(component.getDiscountPercentage()).toBe(0);
  });

  it('getDiscountPercentage returns 0 when originalPrice equals price', () => {
    component.product = { ...mockProduct, originalPrice: 80, price: 80 };
    expect(component.getDiscountPercentage()).toBe(0);
  });

  it('getDiscountPercentage returns the rounded percentage when on sale', () => {
    expect(component.getDiscountPercentage()).toBe(20);
  });
});
