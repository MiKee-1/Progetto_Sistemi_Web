import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth-service';

const mockUser = { id: 1, email: 'mario@example.com', role: 'user' } as any;
const mockResponse = { token: 'jwt-token', user: mockUser };

describe('AuthService', () => {
  let service: AuthService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    localStorage.clear();
  });

  it('login stores token and user in localStorage and updates signals', () => {
    service.login({ email: 'mario@example.com', password: 'secret' }).subscribe();

    httpController.expectOne('http://localhost:3000/api/login').flush(mockResponse);

    expect(localStorage.getItem('auth_token')).toBe('jwt-token');
    expect(JSON.parse(localStorage.getItem('current_user')!)).toEqual(mockUser);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('register stores token and user in localStorage and updates signals', () => {
    service.register({ email: 'mario@example.com', password: 'secret', firstName: 'Mario', lastName: 'Rossi' } as any).subscribe();

    httpController.expectOne('http://localhost:3000/api/register').flush(mockResponse);

    expect(localStorage.getItem('auth_token')).toBe('jwt-token');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('logout clears localStorage and resets signals', () => {
    localStorage.setItem('auth_token', 'jwt-token');
    localStorage.setItem('current_user', JSON.stringify(mockUser));

    service.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('current_user')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('getToken returns the stored token', () => {
    localStorage.setItem('auth_token', 'my-token');
    expect(service.getToken()).toBe('my-token');
  });

  it('getToken returns null when no token is stored', () => {
    expect(service.getToken()).toBeNull();
  });

  // Il servizio legge il localStorage alla costruzione: per testare isAdmin serve
  // un'istanza creata DOPO aver popolato lo storage (reset del testing module).
  function freshService(): AuthService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    return TestBed.inject(AuthService);
  }

  it('isAdmin returns true when current user has admin role', () => {
    localStorage.setItem('current_user', JSON.stringify({ ...mockUser, role: 'admin' }));
    expect(freshService().isAdmin()).toBe(true);
  });

  it('isAdmin returns false when current user is not admin', () => {
    localStorage.setItem('current_user', JSON.stringify(mockUser));
    expect(freshService().isAdmin()).toBe(false);
  });
});
