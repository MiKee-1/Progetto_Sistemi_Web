import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

const mockSnackBar = { open: vi.fn() };

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: mockSnackBar }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('showError opens an error snackbar with 5s default duration', () => {
    service.showError('Qualcosa è andato storto');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Qualcosa è andato storto',
      'Chiudi',
      expect.objectContaining({ duration: 5000, panelClass: ['error-snackbar'] })
    );
  });

  it('showSuccess opens a success snackbar with 3s default duration', () => {
    service.showSuccess('Operazione completata');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Operazione completata',
      'Chiudi',
      expect.objectContaining({ duration: 3000, panelClass: ['success-snackbar'] })
    );
  });

  it('showWarning opens a warning snackbar with 4s default duration', () => {
    service.showWarning('Attenzione');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Attenzione',
      'Chiudi',
      expect.objectContaining({ duration: 4000, panelClass: ['warning-snackbar'] })
    );
  });

  it('honours a custom duration', () => {
    service.showError('Errore breve', 1000);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Errore breve',
      'Chiudi',
      expect.objectContaining({ duration: 1000 })
    );
  });
});
