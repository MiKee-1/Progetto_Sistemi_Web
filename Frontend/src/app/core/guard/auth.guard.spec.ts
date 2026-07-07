import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth-service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: { isLoggedIn: ReturnType<typeof vi.fn> };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn() };
    router = { createUrlTree: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows access when the user is logged in', () => {
    authService.isLoggedIn.mockReturnValue(true);
    expect(executeGuard({} as any, {} as any)).toBe(true);
  });

  it('redirects to /login when the user is not logged in', () => {
    const loginTree = {} as UrlTree;
    authService.isLoggedIn.mockReturnValue(false);
    router.createUrlTree.mockReturnValue(loginTree);

    const result = executeGuard({} as any, {} as any);

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginTree);
  });
});
