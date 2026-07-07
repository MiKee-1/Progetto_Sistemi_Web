import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

const mockProduct = { id: '1', title: 'Shoe', price: 49.99 } as any;
const mockProductResponse = { message: 'OK', product: mockProduct };

describe('AdminService', () => {
  let service: AdminService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('createProduct sends POST /api/admin/products with product wrapped in product key', () => {
    service.createProduct(mockProduct).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product: mockProduct });
    req.flush(mockProductResponse);
  });

  it('updateProduct sends PUT /api/admin/products/:id with product wrapped in product key', () => {
    service.updateProduct('1', { title: 'Updated' }).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/products/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ product: { title: 'Updated' } });
    req.flush(mockProductResponse);
  });

  it('deleteProduct sends DELETE /api/admin/products/:id', () => {
    service.deleteProduct('1').subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });

  it('adjustQuantity sends PATCH /api/admin/products/:id/adjust_quantity with adjustment', () => {
    service.adjustQuantity('1', 5).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/products/1/adjust_quantity');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ adjustment: 5 });
    req.flush(mockProductResponse);
  });

  it('getOrders sends GET /api/admin/orders without user_id when not provided', () => {
    service.getOrders().subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/orders');
    expect(req.request.method).toBe('GET');
    req.flush({ orders: [], stats: {} });
  });

  it('getOrders sends GET /api/admin/orders?user_id=:id when userId is provided', () => {
    service.getOrders(42).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/orders?user_id=42');
    expect(req.request.method).toBe('GET');
    req.flush({ orders: [], stats: {} });
  });

  it('getOrderById sends GET /api/admin/orders/:id', () => {
    service.getOrderById(7).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/orders/7');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deleteOrder sends DELETE /api/admin/orders/:id', () => {
    service.deleteOrder(3).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/admin/orders/3');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });

  it('getStats sends GET /api/admin/stats and returns stats object', () => {
    const mockStats = { total_orders: 10, total_revenue: 500, total_users: 5, total_products: 20, low_stock_products: 2, recent_orders: [] };
    service.getStats().subscribe(stats => expect(stats).toEqual(mockStats));
    httpController.expectOne('http://localhost:3000/api/admin/stats').flush(mockStats);
  });
});
