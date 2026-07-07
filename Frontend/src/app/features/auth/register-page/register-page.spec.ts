import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterPage } from './register-page';
import { AuthService } from '../../../core/services/auth-service';
import { CartService } from '../../../core/services/cart.service';

const mockAuthService = { register: vi.fn() };
const mockCartService = { loadCart: vi.fn() };

const validFormValue = {
  first_name: 'Mario',
  last_name: 'Rossi',
  email: 'mario@example.com',
  address: 'Via Roma 1',
  password: 'secret123',
  password_confirmation: 'secret123',
};

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let router: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    router = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue({}),
      serializeUrl: vi.fn().mockReturnValue('/'),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when all fields are empty', () => {
    expect(component.registerForm.valid).toBe(false);
  });

  it('form is invalid with a malformed email', () => {
    component.registerForm.setValue({ ...validFormValue, email: 'not-an-email' });
    expect(component.registerForm.get('email')!.valid).toBe(false);
  });

  it('form is invalid when password is shorter than 6 characters', () => {
    component.registerForm.setValue({ ...validFormValue, password: '123', password_confirmation: '123' });
    expect(component.registerForm.get('password')!.valid).toBe(false);
  });

  it('passwordMatchValidator returns error when passwords do not match', () => {
    component.registerForm.setValue({ ...validFormValue, password_confirmation: 'different' });
    expect(component.registerForm.errors).toEqual({ passwordMismatch: true });
  });

  it('form is valid with all required fields filled and matching passwords', () => {
    component.registerForm.setValue(validFormValue);
    expect(component.registerForm.valid).toBe(true);
  });

  it('togglePasswordVisibility toggles hidePassword signal', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
  });

  it('onSubmit does not call authService.register when form is invalid', () => {
    component.onSubmit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('onSubmit calls authService.register with form values when form is valid', () => {
    mockAuthService.register.mockReturnValue(of({ user: { role: 'user' } }));
    component.registerForm.setValue(validFormValue);
    component.onSubmit();
    expect(mockAuthService.register).toHaveBeenCalledWith(validFormValue);
  });

  it('on success: loads cart and navigates to /products', () => {
    mockAuthService.register.mockReturnValue(of({ user: { role: 'user' } }));
    component.registerForm.setValue(validFormValue);
    component.onSubmit();
    expect(mockCartService.loadCart).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.loading()).toBe(false);
  });

  it('on error with error.error.errors array: joins messages into error signal', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => ({ error: { errors: ['Email già in uso', 'Password troppo corta'] } }))
    );
    component.registerForm.setValue(validFormValue);
    component.onSubmit();
    expect(component.error()).toBe('Email già in uso, Password troppo corta');
    expect(component.loading()).toBe(false);
  });

  it('on error with error.error.error string: sets error signal', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => ({ error: { error: 'Email già in uso.' } }))
    );
    component.registerForm.setValue(validFormValue);
    component.onSubmit();
    expect(component.error()).toBe('Email già in uso.');
  });
});
