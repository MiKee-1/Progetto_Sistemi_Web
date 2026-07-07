import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order-service';

const mockOrder = { id: 1, total: 99.99 } as any;

describe('OrderService', () => {
  let service: OrderService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('create sends POST /api/orders with order wrapped in order key', () => {
    service.create(mockOrder).subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ order: mockOrder });
    req.flush(mockOrder);
  });

  it('getOrders sends GET /api/orders without params when no filters given', () => {
    service.getOrders().subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush([mockOrder]);
  });

  it('getOrders sends minTotal and maxTotal as query params', () => {
    service.getOrders({ minTotal: 50, maxTotal: 200 }).subscribe();
    const req = httpController.expectOne(r => r.url === 'http://localhost:3000/api/orders');
    expect(req.request.params.get('min_total')).toBe('50');
    expect(req.request.params.get('max_total')).toBe('200');
    req.flush([mockOrder]);
  });

  it('getOrders sends date range and productTitle filters', () => {
    service.getOrders({ startDate: '2024-01-01', endDate: '2024-12-31', productTitle: 'shoe' }).subscribe();
    const req = httpController.expectOne(r => r.url === 'http://localhost:3000/api/orders');
    expect(req.request.params.get('start_date')).toBe('2024-01-01');
    expect(req.request.params.get('end_date')).toBe('2024-12-31');
    expect(req.request.params.get('product_title')).toBe('shoe');
    req.flush([mockOrder]);
  });
});
