import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { AdminService } from '../../../core/services/admin.service';
import { ProductApi } from '../../../core/services/product-api';
import { Product } from '../../../core/models/product';
import { Order } from '../../../core/models/order';

const mockStats = { totalOrders: 5, totalRevenue: 500, totalUsers: 3, totalProducts: 10 } as any;
const mockProducts = [
  { id: 'p1', title: 'Widget', price: 10, originalPrice: 12, sale: true, quantity: 4, tags: ['tech'] },
  { id: 'p2', title: 'Gadget', price: 20, originalPrice: 20, sale: false, quantity: 0, tags: [] },
] as unknown as Product[];
const mockOrdersResponse = { orders: [], total: 0 } as any;

const mockAdminService = {
  getStats: vi.fn(),
  getOrders: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  adjustQuantity: vi.fn(),
  deleteOrder: vi.fn(),
};
const mockProductApi = { listAll: vi.fn() };

function fillValidProductForm(component: AdminDashboard) {
  component.productForm.patchValue({
    id: 'p9',
    title: 'Nuovo prodotto',
    description: 'desc',
    price: 15,
    original_price: 20,
    sale: true,
    quantity: 3,
    thumbnail: '',
    tags: ['tech'],
  });
}

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAdminService.getStats.mockReturnValue(of(mockStats));
    mockAdminService.getOrders.mockReturnValue(of(mockOrdersResponse));
    mockAdminService.createProduct.mockReturnValue(of({}));
    mockAdminService.updateProduct.mockReturnValue(of({}));
    mockAdminService.deleteProduct.mockReturnValue(of({}));
    mockAdminService.adjustQuantity.mockReturnValue(of({}));
    mockAdminService.deleteOrder.mockReturnValue(of({}));
    mockProductApi.listAll.mockReturnValue(of(mockProducts));

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideNoopAnimations(),
        { provide: AdminService, useValue: mockAdminService },
        { provide: ProductApi, useValue: mockProductApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads stats, products and orders', () => {
    component.ngOnInit();
    expect(component.stats()).toEqual(mockStats);
    expect(component.products()).toEqual(mockProducts);
    expect(component.orders()).toEqual(mockOrdersResponse);
    expect(component.loading()).toBe(false);
  });

  it('loadProducts clears loading even on error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockProductApi.listAll.mockReturnValue(throwError(() => new Error('boom')));
    component.loadProducts();
    expect(component.loading()).toBe(false);
  });

  // ─── Gestione prodotti ───────────────────────────────────────────────────

  it('onEditProduct fills the form with the product values', () => {
    component.onEditProduct(mockProducts[0]);
    expect(component.editingProduct()).toEqual(mockProducts[0]);
    expect(component.productForm.value).toEqual(
      expect.objectContaining({ id: 'p1', title: 'Widget', original_price: 12 }));
  });

  it('onSaveProduct does nothing when the form is invalid', () => {
    component.onSaveProduct();
    expect(mockAdminService.createProduct).not.toHaveBeenCalled();
    expect(mockAdminService.updateProduct).not.toHaveBeenCalled();
  });

  it('onSaveProduct creates a new product and resets the form', () => {
    fillValidProductForm(component);
    component.onSaveProduct();
    expect(mockAdminService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p9', title: 'Nuovo prodotto', price: 15 }));
    expect(component.editingProduct()).toBeNull();
    expect(component.productForm.value.id).toBeNull();
  });

  it('onSaveProduct updates the product being edited', () => {
    component.onEditProduct(mockProducts[0]);
    component.productForm.patchValue({ title: 'Widget rinominato' });
    component.onSaveProduct();
    expect(mockAdminService.updateProduct).toHaveBeenCalledWith('p1',
      expect.objectContaining({ title: 'Widget rinominato' }));
    expect(mockAdminService.createProduct).not.toHaveBeenCalled();
    expect(component.editingProduct()).toBeNull();
  });

  it('onDeleteProduct deletes only after confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.onDeleteProduct('p1');
    expect(mockAdminService.deleteProduct).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    component.onDeleteProduct('p1');
    expect(mockAdminService.deleteProduct).toHaveBeenCalledWith('p1');
  });

  it('onAdjustQuantity updates the local list optimistically and calls the service', () => {
    component.products.set([...mockProducts]);
    component.onAdjustQuantity('p1', 10);
    expect(component.products().find(p => p.id === 'p1')!.quantity).toBe(14);
    expect(mockAdminService.adjustQuantity).toHaveBeenCalledWith('p1', 10);
  });

  it('onAdjustQuantity reloads the products when the service fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAdminService.adjustQuantity.mockReturnValue(throwError(() => new Error('boom')));
    component.products.set([...mockProducts]);
    component.onAdjustQuantity('p1', 10);
    expect(mockProductApi.listAll).toHaveBeenCalled();
  });

  // ─── Tag chips ───────────────────────────────────────────────────────────

  it('addTag normalizes to lowercase and ignores duplicates', () => {
    const chipInput = { clear: vi.fn() };
    component.addTag({ value: ' TECH ', chipInput } as any);
    expect(component.productForm.get('tags')!.value).toEqual(['tech']);
    component.addTag({ value: 'tech', chipInput } as any);
    expect(component.productForm.get('tags')!.value).toEqual(['tech']);
    expect(chipInput.clear).toHaveBeenCalledTimes(2);
  });

  it('removeTag removes the tag from the form', () => {
    component.productForm.patchValue({ tags: ['tech', 'home'] });
    component.removeTag('tech');
    expect(component.productForm.get('tags')!.value).toEqual(['home']);
  });

  // ─── Ordini ──────────────────────────────────────────────────────────────

  it('onDeleteOrder deletes only after confirmation and refreshes data', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.onDeleteOrder(3);
    expect(mockAdminService.deleteOrder).toHaveBeenCalledWith(3);
    expect(mockProductApi.listAll).toHaveBeenCalled();
  });

  it('getOrderItemsCount sums quantities and defaults to 0', () => {
    expect(component.getOrderItemsCount(
      { orderItems: [{ quantity: 1 }, { quantity: 4 }] } as unknown as Order)).toBe(5);
    expect(component.getOrderItemsCount({} as Order)).toBe(0);
  });
});
