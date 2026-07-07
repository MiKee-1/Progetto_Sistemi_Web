import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpController: HttpTestingController;
  let authService: { logout: ReturnType<typeof vi.fn> };
  let notificationService: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn>; url: string };

  beforeEach(() => {
    authService = { logout: vi.fn() };
    notificationService = { showError: vi.fn(), showSuccess: vi.fn() };
    router = { navigate: vi.fn(), url: '/products' };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('calls logout and navigates to /login on 401', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpController.expectOne('/api/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ sessionExpired: 'true' }) })
    );
  });

  it('does not logout on 401 when the request targets an auth endpoint', () => {
    http.get('/auth/login').subscribe({ error: () => {} });
    httpController.expectOne('/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not show an error notification on 401', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpController.expectOne('/api/test').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(notificationService.showError).not.toHaveBeenCalled();
  });

  it('does not show an error notification on 404', () => {
    http.get('/api/missing').subscribe({ error: () => {} });
    httpController.expectOne('/api/missing').flush({}, { status: 404, statusText: 'Not Found' });

    expect(notificationService.showError).not.toHaveBeenCalled();
  });

  it('shows a server error notification on 500', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpController.expectOne('/api/test').flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Errore del server. Riprova tra qualche minuto.'
    );
  });

  it('shows the backend message on 422 with error.error.error', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpController.expectOne('/api/test').flush(
      { error: 'Email già in uso.' },
      { status: 422, statusText: 'Unprocessable Entity' }
    );

    expect(notificationService.showError).toHaveBeenCalledWith('Email già in uso.');
  });

  it('re-throws the error with status and formatted message', () => {
    let captured: any;
    http.get('/api/test').subscribe({ error: (err) => (captured = err) });
    httpController.expectOne('/api/test').flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(captured.status).toBe(500);
    expect(captured.message).toBe('Errore del server. Riprova tra qualche minuto.');
  });
});
