import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginPage } from './login-page';
import { AuthService } from '../../../core/services/auth-service';
import { CartService } from '../../../core/services/cart.service';

const mockAuthService = { login: vi.fn() };
const mockCartService = { loadCart: vi.fn() };

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let router: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    router = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue({}),
      serializeUrl: vi.fn().mockReturnValue('/'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when email and password are empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('form is invalid with a malformed email', () => {
    component.loginForm.setValue({ email: 'not-an-email', password: 'password123' });
    expect(component.loginForm.get('email')!.valid).toBe(false);
  });

  it('form is invalid when password is shorter than 6 characters', () => {
    component.loginForm.setValue({ email: 'user@example.com', password: '123' });
    expect(component.loginForm.get('password')!.valid).toBe(false);
  });

  it('form is valid with correct email and password', () => {
    component.loginForm.setValue({ email: 'user@example.com', password: 'secret123' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('togglePasswordVisibility toggles hidePassword signal', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  it('onSubmit does not call authService.login when form is invalid', () => {
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('onSubmit calls authService.login with form values when form is valid', () => {
    mockAuthService.login.mockReturnValue(of({ user: { role: 'user' } }));
    component.loginForm.setValue({ email: 'user@example.com', password: 'secret123' });
    component.onSubmit();
    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' });
  });

  it('on success with user role: loads cart and navigates to /products', () => {
    mockAuthService.login.mockReturnValue(of({ user: { role: 'user' } }));
    component.loginForm.setValue({ email: 'user@example.com', password: 'secret123' });
    component.onSubmit();
    expect(mockCartService.loadCart).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('on success with admin role: loads cart and navigates to /admin', () => {
    mockAuthService.login.mockReturnValue(of({ user: { role: 'admin' } }));
    component.loginForm.setValue({ email: 'admin@example.com', password: 'secret123' });
    component.onSubmit();
    expect(mockCartService.loadCart).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('on error: sets error signal and clears loading', () => {
    mockAuthService.login.mockReturnValue(throwError(() => ({ error: { error: 'Invalid credentials' } })));
    component.loginForm.setValue({ email: 'user@example.com', password: 'wrongpass' });
    component.onSubmit();
    expect(component.error()).toBe('Invalid credentials');
    expect(component.loading()).toBe(false);
  });
});
