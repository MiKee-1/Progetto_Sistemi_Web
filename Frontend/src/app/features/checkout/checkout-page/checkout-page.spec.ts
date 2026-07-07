import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CheckoutPage } from './checkout-page';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order-service';

const mockItems = [
  { id: 1, product: { id: 'p1', title: 'Widget', price: 80 }, quantity: 2 },
];

const mockCartService = {
  items: vi.fn(),
  total: vi.fn(),
  isEmpty: vi.fn(),
  clearCart: vi.fn(),
};
const mockOrderService = { create: vi.fn() };

function fillValidForm(component: CheckoutPage) {
  component.form.setValue({
    customer: { firstName: 'Mario', lastName: 'Rossi', email: 'mario@example.com' },
    address: { street: 'Via Roma 1', city: 'Milano', zip: '20100' },
    shippingMethod: 'standard',
    privacy: true,
  });
}

describe('CheckoutPage', () => {
  let component: CheckoutPage;
  let fixture: ComponentFixture<CheckoutPage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCartService.items.mockReturnValue(mockItems);
    mockCartService.total.mockReturnValue(160);
    mockCartService.isEmpty.mockReturnValue(false);
    mockCartService.clearCart.mockReturnValue(of({}));
    mockOrderService.create.mockReturnValue(of({ id: 1 }));

    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideNoopAnimations(),
        { provide: CartService, useValue: mockCartService },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Validazione del form (Reactive Forms) ────────────────────────────────

  it('form is invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('form is invalid with a malformed email', () => {
    fillValidForm(component);
    component.form.get('customer.email')!.setValue('not-an-email');
    expect(component.form.valid).toBe(false);
  });

  it('form is invalid when zip is not a 5-digit code', () => {
    fillValidForm(component);
    component.form.get('address.zip')!.setValue('12AB');
    expect(component.form.valid).toBe(false);
  });

  it('form is invalid until privacy is accepted', () => {
    fillValidForm(component);
    component.form.get('privacy')!.setValue(false);
    expect(component.form.valid).toBe(false);
  });

  it('form is valid with complete correct data', () => {
    fillValidForm(component);
    expect(component.form.valid).toBe(true);
  });

  it('hasError reports an error only after the control is touched', () => {
    const firstName = component.form.get('customer.firstName')!;
    expect(component.hasError('customer.firstName', 'required')).toBe(false);
    firstName.markAsTouched();
    expect(component.hasError('customer.firstName', 'required')).toBe(true);
  });

  // ─── onSubmit ─────────────────────────────────────────────────────────────

  it('onSubmit with invalid form marks all touched, shows summary and does not create the order', () => {
    component.onSubmit();
    expect(component.showSummary).toBe(true);
    expect(component.form.get('customer.firstName')!.touched).toBe(true);
    expect(mockOrderService.create).not.toHaveBeenCalled();
  });

  it('onSubmit with an empty cart sets an error and does not create the order', () => {
    fillValidForm(component);
    mockCartService.isEmpty.mockReturnValue(true);
    component.onSubmit();
    expect(component.orderError).toBe(true);
    expect(component.errorMessage).toContain('carrello è vuoto');
    expect(mockOrderService.create).not.toHaveBeenCalled();
  });

  it('onSubmit success creates the order from the cart, resets the form and clears the cart', () => {
    fillValidForm(component);
    component.onSubmit();

    expect(mockOrderService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: expect.objectContaining({ firstName: 'Mario', email: 'mario@example.com' }),
        address: expect.objectContaining({ city: 'Milano', zip: '20100' }),
        total: 160,
        items: [expect.objectContaining({ id: 'p1', quantity: 2 })],
      })
    );
    expect(component.loading).toBe(false);
    expect(component.orderSuccess).toBe(true);
    expect(component.orderError).toBe(false);
    expect(mockCartService.clearCart).toHaveBeenCalled();
  });

  it('onSubmit error shows the backend error message and clears loading', () => {
    fillValidForm(component);
    mockOrderService.create.mockReturnValue(
      throwError(() => ({ error: { error: 'insufficient stock' } }))
    );
    component.onSubmit();
    expect(component.loading).toBe(false);
    expect(component.orderSuccess).toBe(false);
    expect(component.orderError).toBe(true);
    expect(component.errorMessage).toBe('insufficient stock');
    expect(mockCartService.clearCart).not.toHaveBeenCalled();
  });

  it('onSubmit error without backend message falls back to a generic one', () => {
    fillValidForm(component);
    mockOrderService.create.mockReturnValue(throwError(() => ({ error: {} })));
    component.onSubmit();
    expect(component.errorMessage).toContain('Si è verificato un errore');
  });
});
