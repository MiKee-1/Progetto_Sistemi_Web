import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth-service';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  let authService: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    isAdmin: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn(), isAdmin: vi.fn() };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('returns false and redirects to /login when the user is not logged in', () => {
    authService.isLoggedIn.mockReturnValue(false);

    const result = executeGuard({} as any, {} as any);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(false);
  });

  it('returns false and redirects to /products when logged in but not admin', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.isAdmin.mockReturnValue(false);

    const result = executeGuard({} as any, {} as any);

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
    expect(result).toBe(false);
  });

  it('returns true when user is logged in and has admin role', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.isAdmin.mockReturnValue(true);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(true);
  });
});
