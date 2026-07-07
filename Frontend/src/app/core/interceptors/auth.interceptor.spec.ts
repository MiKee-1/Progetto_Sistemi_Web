import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth-service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpController: HttpTestingController;
  let authService: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { getToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('adds Authorization header when a token is available', () => {
    authService.getToken.mockReturnValue('test-token');

    http.get('/api/test').subscribe();

    const req = httpController.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('does not add Authorization header when no token is available', () => {
    authService.getToken.mockReturnValue(null);

    http.get('/api/test').subscribe();

    const req = httpController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('passes the original request unchanged when no token is available', () => {
    authService.getToken.mockReturnValue(null);

    http.get('/api/test', { params: { foo: 'bar' } }).subscribe();

    const req = httpController.expectOne(r => r.url === '/api/test');
    expect(req.request.params.get('foo')).toBe('bar');
    req.flush({});
  });
});
