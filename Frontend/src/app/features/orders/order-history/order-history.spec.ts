import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { OrderHistoryPage } from './order-history';
import { OrderService } from '../../../core/services/order-service';
import { Order } from '../../../core/models/order';

const mockOrders = [
  { id: 1, total: 100, createdAt: '2026-06-01T10:00:00Z' },
  { id: 2, total: 50, createdAt: '2026-06-02T10:00:00Z' },
] as unknown as Order[];

const mockOrderService = { getOrders: vi.fn() };

describe('OrderHistoryPage', () => {
  let component: OrderHistoryPage;
  let fixture: ComponentFixture<OrderHistoryPage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockOrderService.getOrders.mockReturnValue(of(mockOrders));

    await TestBed.configureTestingModule({
      imports: [OrderHistoryPage],
      providers: [
        provideNoopAnimations(),
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistoryPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads the orders and clears loading', () => {
    component.ngOnInit();
    expect(mockOrderService.getOrders).toHaveBeenCalledWith({});
    expect(component.orders()).toEqual(mockOrders);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('loadOrders failure sets the backend error message', () => {
    mockOrderService.getOrders.mockReturnValue(
      throwError(() => ({ error: { error: 'Unauthorized' } })));
    component.loadOrders();
    expect(component.error()).toBe('Unauthorized');
    expect(component.loading()).toBe(false);
  });

  it('loadOrders sends the populated filters in the expected format', () => {
    component.startDate = new Date('2026-05-01T12:00:00Z');
    component.endDate = new Date('2026-06-30T12:00:00Z');
    component.minTotal = 10;
    component.maxTotal = 200;
    component.productTitle = '  laptop  ';

    component.loadOrders();

    expect(mockOrderService.getOrders).toHaveBeenCalledWith({
      startDate: '2026-05-01',
      endDate: '2026-06-30',
      minTotal: 10,
      maxTotal: 200,
      productTitle: 'laptop',
    });
  });

  it('loadOrders ignores non-positive totals and blank titles', () => {
    component.minTotal = 0;
    component.maxTotal = -5;
    component.productTitle = '   ';
    component.loadOrders();
    expect(mockOrderService.getOrders).toHaveBeenCalledWith({});
  });

  it('applyFilters reloads the orders', () => {
    component.applyFilters();
    expect(mockOrderService.getOrders).toHaveBeenCalledTimes(1);
  });

  it('clearFilters resets every filter and reloads', () => {
    component.startDate = new Date();
    component.minTotal = 10;
    component.productTitle = 'laptop';

    component.clearFilters();

    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
    expect(component.minTotal).toBeNull();
    expect(component.maxTotal).toBeNull();
    expect(component.productTitle).toBe('');
    expect(mockOrderService.getOrders).toHaveBeenCalledWith({});
  });

  it('getOrderItemsCount sums the item quantities', () => {
    const order = { orderItems: [{ quantity: 2 }, { quantity: 3 }] } as unknown as Order;
    expect(component.getOrderItemsCount(order)).toBe(5);
  });

  it('getOrderItemsCount returns 0 without items', () => {
    expect(component.getOrderItemsCount({} as Order)).toBe(0);
  });

  it('formatOrderDate renders an Italian long date', () => {
    const formatted = component.formatOrderDate('2026-06-01T10:30:00Z');
    expect(formatted).toContain('2026');
    expect(formatted.toLowerCase()).toContain('giugno');
  });
});
