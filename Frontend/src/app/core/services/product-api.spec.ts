import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductApi } from './product-api';

const mockProduct = { id: '1', title: 'Test', price: 9.99 } as any;
const mockPage = { products: [mockProduct], total: 1, page: 1, limit: 20 };

describe('ProductApi', () => {
  let service: ProductApi;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductApi);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('list sends GET /api/products without params when no filters given', () => {
    service.list().subscribe();
    const req = httpController.expectOne('http://localhost:3000/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('list sends title and price filters as query params', () => {
    service.list({ title: 'shoe', minPrice: 10, maxPrice: 50 }).subscribe();
    const req = httpController.expectOne(r => r.url === 'http://localhost:3000/api/products');
    expect(req.request.params.get('title')).toBe('shoe');
    expect(req.request.params.get('min_price')).toBe('10');
    expect(req.request.params.get('max_price')).toBe('50');
    req.flush(mockPage);
  });

  it('list sends sort and pagination params', () => {
    service.list({ sort: 'price_asc', page: 2, limit: 10 }).subscribe();
    const req = httpController.expectOne(r => r.url === 'http://localhost:3000/api/products');
    expect(req.request.params.get('sort')).toBe('price_asc');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(mockPage);
  });

  it('getById sends GET /api/products/:id and returns product', () => {
    service.getById('1').subscribe(p => expect(p).toEqual(mockProduct));
    httpController.expectOne('http://localhost:3000/api/products/1').flush(mockProduct);
  });

  it('listAll sends limit=10000 and returns flat array of products', () => {
    service.listAll().subscribe(products => expect(products).toEqual([mockProduct]));
    const req = httpController.expectOne(r => r.url === 'http://localhost:3000/api/products');
    expect(req.request.params.get('limit')).toBe('10000');
    req.flush(mockPage);
  });
});
